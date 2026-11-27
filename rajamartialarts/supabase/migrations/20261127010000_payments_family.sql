-- Adds a "family" payment type (monthly fee at the family rate). Recorded in the fee ledger as 'monthly'.
alter table public.payment_links drop constraint if exists payment_links_kind_check;
alter table public.payment_links add constraint payment_links_kind_check check (kind in ('monthly','family','admission','gi','personal'));
alter table public.payments drop constraint if exists payments_kind_check;
alter table public.payments add constraint payments_kind_check check (kind in ('monthly','family','admission','gi','personal'));
alter table public.payment_links drop constraint if exists link_monthly_needs_period;
alter table public.payment_links add constraint link_monthly_needs_period check (kind not in ('monthly','family') or period is not null);
alter table public.payments drop constraint if exists pay_monthly_needs_period;
alter table public.payments add constraint pay_monthly_needs_period check (kind not in ('monthly','family') or period is not null);
update public.payment_settings set prices = prices || '{"family":7000}'::jsonb where not (prices ? 'family');
alter table public.payment_settings alter column prices set default '{"monthly":8000,"family":7000,"admission":5000,"gi":5000,"personal":25000}'::jsonb;

create or replace function private.pay_ledger(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare p public.payments; fp uuid;
begin
  select * into p from public.payments where id = p_id for update;
  if not found or p.status <> 'successful' or p.student_id is null or p.fee_payment_id is not null then return; end if;
  begin
    insert into public.fee_payments (student_id, kind, period, amount, paid_on, method, notes)
    values (p.student_id, case p.kind when 'family' then 'monthly' else p.kind end, p.period, p.amount, current_date,
            case p.method when 'bank_transfer' then 'bank' else p.method end,
            'Online payment ' || p.reference || case p.kind when 'family' then ' (family rate)' else '' end)
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
