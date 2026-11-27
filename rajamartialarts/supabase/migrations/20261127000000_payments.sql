-- =====================================================================================
-- Raja's Martial Arts — online payments (Easypaisa, JazzCash, Bank Transfer)
-- Additive only: new tables and functions. Existing tables are not altered.
--
-- Safety model
--   * Visitors (anon) can NOT read or write any of these tables. Everything customer-facing goes
--     through server functions that use the service role.
--   * A payment's status can only change through the functions below. Gateway payments become
--     'successful' only when the server has verified them with the gateway (pay_mark_successful,
--     service role only). Bank transfers become 'successful' only when an admin approves them
--     (bank_review, admin only) after entering the bank's own credit reference.
-- =====================================================================================

-- ---------- admin allow-list ----------
insert into public.admins (email) values ('razantariq01@gmail.com') on conflict (email) do nothing;

-- ---------- settings (bank details + fee prices), single row ----------
create table if not exists public.payment_settings (
  id             smallint primary key default 1 check (id = 1),
  bank_name      text check (char_length(bank_name) <= 120),
  account_title  text check (char_length(account_title) <= 120),
  iban           text check (char_length(iban) <= 40),
  account_number text check (char_length(account_number) <= 40),
  branch         text check (char_length(branch) <= 120),
  instructions   text check (char_length(instructions) <= 600),
  prices         jsonb not null default '{"monthly":8000,"admission":5000,"gi":5000,"personal":25000}'::jsonb,
  updated_at     timestamptz not null default now()
);
insert into public.payment_settings (id) values (1) on conflict (id) do nothing;

-- ---------- payment links an admin sends to a specific student ----------
create table if not exists public.payment_links (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  student_id  uuid not null references public.students(id) on delete cascade,
  kind        text not null check (kind in ('monthly','admission','gi','personal')),
  period      date check (period is null or period = date_trunc('month', period)::date),
  amount      integer not null check (amount > 0 and amount <= 500000),
  note        text check (char_length(note) <= 200),
  status      text not null default 'open' check (status in ('open','used','revoked')),
  expires_at  timestamptz not null default now() + interval '14 days',
  created_by  text,
  created_at  timestamptz not null default now(),
  constraint link_monthly_needs_period check (kind <> 'monthly' or period is not null)
);

-- ---------- payments ----------
create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),
  reference            text not null unique,
  status               text not null default 'pending' check (status in ('pending','successful','failed')),
  stage                text not null default 'created' check (stage in
                         ('created','redirected','awaiting_receipt','receipt_submitted','verified','rejected','gateway_failed','expired')),
  method               text not null check (method in ('easypaisa','jazzcash','bank_transfer')),
  kind                 text not null check (kind in ('monthly','admission','gi','personal')),
  period               date check (period is null or period = date_trunc('month', period)::date),
  amount               integer not null check (amount > 0 and amount <= 500000),
  currency             text not null default 'PKR' check (currency = 'PKR'),
  student_id           uuid references public.students(id) on delete set null,
  link_id              uuid references public.payment_links(id) on delete set null,
  payer_name           text check (char_length(payer_name) <= 120),
  payer_phone          text check (char_length(payer_phone) <= 30),
  gateway_txn_id       text,
  gateway_response     jsonb,          -- raw gateway data; never sent to browsers
  failure_reason       text check (char_length(failure_reason) <= 300),
  receipt_path         text,
  receipt_mime         text,
  receipt_uploaded_at  timestamptz,
  bank_sender          text check (char_length(bank_sender) <= 120),
  bank_payer_ref       text check (char_length(bank_payer_ref) <= 80),    -- typed by the payer
  bank_credit_ref      text check (char_length(bank_credit_ref) <= 80),   -- typed by the admin from the bank statement
  reviewed_by          text,
  reviewed_at          timestamptz,
  review_note          text check (char_length(review_note) <= 300),
  fee_payment_id       uuid references public.fee_payments(id) on delete set null,
  verified_at          timestamptz,
  expires_at           timestamptz not null default now() + interval '2 days',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint pay_monthly_needs_period check (kind <> 'monthly' or period is not null),
  constraint pay_success_is_verified check (status <> 'successful' or verified_at is not null)
);
create unique index if not exists payments_gateway_txn_uq on public.payments (method, gateway_txn_id) where gateway_txn_id is not null;
create index if not exists payments_status_idx on public.payments (status, method, created_at desc);
create index if not exists payments_student_idx on public.payments (student_id);

-- ---------- audit log ----------
create table if not exists public.payment_events (
  id          bigint generated always as identity primary key,
  payment_id  uuid not null references public.payments(id) on delete cascade,
  at          timestamptz not null default now(),
  actor       text not null,
  event       text not null,
  detail      jsonb not null default '{}'::jsonb
);
create index if not exists payment_events_payment_idx on public.payment_events (payment_id, at);

-- ---------- security: RLS on, no access for visitors ----------
alter table public.payment_settings enable row level security;
alter table public.payment_links    enable row level security;
alter table public.payments         enable row level security;
alter table public.payment_events   enable row level security;

revoke all on public.payment_settings, public.payment_links, public.payments, public.payment_events from anon, authenticated;
grant select, update            on public.payment_settings to authenticated;
grant select, insert, update, delete on public.payment_links    to authenticated;
grant select                    on public.payments          to authenticated;
grant select                    on public.payment_events    to authenticated;

drop policy if exists "admins manage payment settings" on public.payment_settings;
create policy "admins manage payment settings" on public.payment_settings for all to authenticated
  using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins manage payment links" on public.payment_links;
create policy "admins manage payment links" on public.payment_links for all to authenticated
  using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins read payments" on public.payments;
create policy "admins read payments" on public.payments for select to authenticated using (private.is_admin());
drop policy if exists "admins read payment events" on public.payment_events;
create policy "admins read payment events" on public.payment_events for select to authenticated using (private.is_admin());

-- ---------- receipts bucket (private; images and PDF, 5 MB) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];
drop policy if exists "admins read receipts" on storage.objects;
create policy "admins read receipts" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and private.is_admin());

-- ---------- internal helpers ----------
create or replace function private.pay_log(p_payment uuid, p_actor text, p_event text, p_detail jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into public.payment_events (payment_id, actor, event, detail) values (p_payment, p_actor, p_event, coalesce(p_detail, '{}'::jsonb));
$$;

-- Copies a successful payment into the existing fee ledger (fee_payments) once.
create or replace function private.pay_ledger(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare p public.payments; fp uuid;
begin
  select * into p from public.payments where id = p_id for update;
  if not found or p.status <> 'successful' or p.student_id is null or p.fee_payment_id is not null then return; end if;
  begin
    insert into public.fee_payments (student_id, kind, period, amount, paid_on, method, notes)
    values (p.student_id, p.kind, p.period, p.amount, current_date,
            case p.method when 'bank_transfer' then 'bank' else p.method end,
            'Online payment ' || p.reference)
    returning id into fp;
  exception when unique_violation then
    perform private.pay_log(p.id, 'system', 'ledger_skipped_duplicate',
      '{"note":"This month was already recorded for the student. Payment kept as successful; no duplicate ledger row."}'::jsonb);
    return;
  end;
  update public.payments set fee_payment_id = fp, updated_at = now() where id = p.id;
  if p.kind = 'admission' then update public.students set admission_paid = true where id = p.student_id;
  elsif p.kind = 'gi' then update public.students set gi_purchased = true where id = p.student_id; end if;
  perform private.pay_log(p.id, 'system', 'ledger_recorded', jsonb_build_object('fee_payment_id', fp));
end $$;

-- ---------- gateway result: SUCCESS (service role only) ----------
-- Call only after the gateway's own server-to-server inquiry confirmed the payment.
create or replace function public.pay_mark_successful(p_reference text, p_gateway_txn text, p_amount integer, p_raw jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare p public.payments;
begin
  select * into p from public.payments where reference = p_reference for update;
  if not found then return 'not_found'; end if;
  if p.method not in ('easypaisa','jazzcash') then return 'not_allowed'; end if;     -- bank transfers need an admin
  if p.status = 'successful' then return 'already'; end if;
  if p_gateway_txn is null or char_length(btrim(p_gateway_txn)) < 3 then
    perform private.pay_log(p.id, 'gateway:' || p.method, 'rejected_no_txn_id', '{}'::jsonb); return 'no_txn_id';
  end if;
  if p_amount is distinct from p.amount then
    perform private.pay_log(p.id, 'gateway:' || p.method, 'rejected_amount_mismatch',
      jsonb_build_object('expected', p.amount, 'reported', p_amount));
    return 'amount_mismatch';                                                          -- stays pending for an admin to look at
  end if;
  begin
    update public.payments set status = 'successful', stage = 'verified', gateway_txn_id = p_gateway_txn,
           gateway_response = p_raw, verified_at = now(), failure_reason = null, updated_at = now()
     where id = p.id;
  exception when unique_violation then
    perform private.pay_log(p.id, 'gateway:' || p.method, 'rejected_duplicate_txn', jsonb_build_object('txn', p_gateway_txn));
    return 'duplicate_txn';
  end;
  perform private.pay_log(p.id, 'gateway:' || p.method, 'verified_successful', jsonb_build_object('txn', p_gateway_txn));
  update public.payment_links set status = 'used' where id = p.link_id and status = 'open';
  perform private.pay_ledger(p.id);
  return 'ok';
end $$;

-- ---------- gateway result: FAILURE (service role only; never touches a successful payment) ----------
create or replace function public.pay_mark_failed(p_reference text, p_reason text, p_raw jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare p public.payments;
begin
  select * into p from public.payments where reference = p_reference for update;
  if not found then return 'not_found'; end if;
  if p.method not in ('easypaisa','jazzcash') or p.status <> 'pending' then return 'ignored'; end if;
  update public.payments set status = 'failed', stage = 'gateway_failed', failure_reason = left(coalesce(p_reason, 'Declined by gateway'), 300),
         gateway_response = coalesce(p_raw, gateway_response), updated_at = now() where id = p.id;
  perform private.pay_log(p.id, 'gateway:' || p.method, 'verified_failed', jsonb_build_object('reason', left(coalesce(p_reason,''), 200)));
  return 'ok';
end $$;

-- ---------- bank transfer: payer uploaded a receipt (service role only) ----------
create or replace function public.pay_bank_submit(p_reference text, p_path text, p_mime text, p_sender text, p_payer_ref text)
returns text language plpgsql security definer set search_path = '' as $$
declare p public.payments;
begin
  select * into p from public.payments where reference = p_reference for update;
  if not found then return 'not_found'; end if;
  if p.method <> 'bank_transfer' or p.status <> 'pending' then return 'not_allowed'; end if;
  if p.expires_at < now() and p.receipt_path is null then return 'expired'; end if;
  update public.payments set receipt_path = p_path, receipt_mime = p_mime, receipt_uploaded_at = now(),
         bank_sender = nullif(btrim(p_sender), ''), bank_payer_ref = nullif(btrim(p_payer_ref), ''),
         stage = 'receipt_submitted', updated_at = now() where id = p.id;
  perform private.pay_log(p.id, 'customer', 'receipt_uploaded', jsonb_build_object('mime', p_mime));
  return 'ok';
end $$;

-- ---------- bank transfer: admin decision ----------
create or replace function public.bank_review(p_payment_id uuid, p_decision text, p_credit_ref text, p_note text)
returns text language plpgsql security definer set search_path = '' as $$
declare p public.payments; who text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if not private.is_admin() then raise exception 'Not authorised' using errcode = '42501'; end if;
  select * into p from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  if p.method <> 'bank_transfer' then raise exception 'Only bank transfers are reviewed here'; end if;
  if p.status <> 'pending' then raise exception 'This payment is already %', p.status; end if;
  if p_decision = 'approve' then
    if p.receipt_path is null then raise exception 'No receipt has been uploaded yet'; end if;
    if char_length(btrim(coalesce(p_credit_ref, ''))) < 4 then
      raise exception 'Enter the bank reference of the credit you checked in the account statement';
    end if;
    update public.payments set status = 'successful', stage = 'verified', verified_at = now(), reviewed_by = who, reviewed_at = now(),
           bank_credit_ref = btrim(p_credit_ref), review_note = nullif(btrim(coalesce(p_note, '')), ''), failure_reason = null, updated_at = now()
     where id = p.id;
    perform private.pay_log(p.id, 'admin:' || who, 'approved', jsonb_build_object('bank_credit_ref', btrim(p_credit_ref)));
    update public.payment_links set status = 'used' where id = p.link_id and status = 'open';
    perform private.pay_ledger(p.id);
    return 'approved';
  elsif p_decision = 'reject' then
    if char_length(btrim(coalesce(p_note, ''))) < 3 then raise exception 'Give a short reason for rejecting'; end if;
    update public.payments set status = 'failed', stage = 'rejected', reviewed_by = who, reviewed_at = now(),
           review_note = btrim(p_note), failure_reason = left(btrim(p_note), 300), updated_at = now() where id = p.id;
    perform private.pay_log(p.id, 'admin:' || who, 'rejected', jsonb_build_object('note', left(btrim(p_note), 200)));
    return 'rejected';
  end if;
  raise exception 'Decision must be approve or reject';
end $$;

-- ---------- admin: attach an unmatched payment to a student ----------
create or replace function public.payment_attach_student(p_payment_id uuid, p_student_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare p public.payments; who text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if not private.is_admin() then raise exception 'Not authorised' using errcode = '42501'; end if;
  select * into p from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;
  if p.fee_payment_id is not null then raise exception 'This payment is already in the fee records'; end if;
  if not exists (select 1 from public.students where id = p_student_id) then raise exception 'Student not found'; end if;
  update public.payments set student_id = p_student_id, updated_at = now() where id = p.id;
  perform private.pay_log(p.id, 'admin:' || who, 'student_attached', jsonb_build_object('student_id', p_student_id));
  perform private.pay_ledger(p.id);
  return 'ok';
end $$;

-- ---------- housekeeping: close bank payments that never got a receipt (service role only) ----------
create or replace function public.pay_expire_stale()
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  with x as (
    update public.payments set status = 'failed', stage = 'expired', failure_reason = 'Expired without a receipt', updated_at = now()
     where method = 'bank_transfer' and status = 'pending' and receipt_path is null and expires_at < now()
    returning id)
  select count(*) into n from x;
  return n;
end $$;

-- ---------- who may run what ----------
revoke execute on function public.pay_mark_successful(text, text, integer, jsonb) from public, anon, authenticated;
revoke execute on function public.pay_mark_failed(text, text, jsonb)              from public, anon, authenticated;
revoke execute on function public.pay_bank_submit(text, text, text, text, text)   from public, anon, authenticated;
revoke execute on function public.pay_expire_stale()                              from public, anon, authenticated;
grant  execute on function public.pay_mark_successful(text, text, integer, jsonb) to service_role;
grant  execute on function public.pay_mark_failed(text, text, jsonb)              to service_role;
grant  execute on function public.pay_bank_submit(text, text, text, text, text)   to service_role;
grant  execute on function public.pay_expire_stale()                              to service_role;

revoke execute on function public.bank_review(uuid, text, text, text)             from public, anon;
revoke execute on function public.payment_attach_student(uuid, uuid)              from public, anon;
grant  execute on function public.bank_review(uuid, text, text, text)             to authenticated;   -- checks private.is_admin() inside
grant  execute on function public.payment_attach_student(uuid, uuid)              to authenticated;   -- checks private.is_admin() inside
