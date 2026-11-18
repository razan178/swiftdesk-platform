-- SwiftDesk website enquiries
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  business text check (char_length(business) <= 160),
  need text check (char_length(need) <= 60),
  message text check (char_length(message) <= 4000),
  page text check (char_length(page) <= 500),
  status text not null default 'new' check (status in ('new','contacted','won','lost'))
);

alter table public.leads enable row level security;

-- Website visitors may only add new enquiries. Nobody can read them through the public key.
revoke all on public.leads from anon, authenticated;
grant insert (name, business, need, message, page) on public.leads to anon;

drop policy if exists "website can add leads" on public.leads;
create policy "website can add leads" on public.leads
  for insert to anon
  with check (status = 'new');
