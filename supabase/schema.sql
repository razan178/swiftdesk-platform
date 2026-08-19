-- ============================================================================
-- Islamabad Thrift Store — database schema
-- Run this once in your Supabase project:
--   Supabase dashboard → SQL Editor → New query → paste this → Run
-- It creates the products table, security policies, and the image storage
-- bucket. Safe to re-run (uses "if not exists" / "drop policy if exists").
-- ============================================================================

-- Extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- ── Products table ──────────────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  brand       text not null default '',
  category    text not null default 'Other',
  gender      text not null default 'Unisex',
  size        text not null default '',
  price       integer not null default 0 check (price >= 0),
  condition   text not null default 'Good',
  description text not null default '',
  images      text[] not null default '{}',
  status      text not null default 'available' check (status in ('available','sold')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_status_idx     on public.products (status);
create index if not exists products_created_at_idx  on public.products (created_at desc);
create index if not exists products_category_idx    on public.products (category);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Row-Level Security ──────────────────────────────────────────────────────
-- Anyone may READ products (public storefront). Only authenticated admins may
-- create / edit / delete. This is the real security boundary: the anon key
-- shipped to the browser cannot write.
alter table public.products enable row level security;

drop policy if exists "public can read products" on public.products;
create policy "public can read products"
  on public.products for select
  using (true);

drop policy if exists "authenticated can insert products" on public.products;
create policy "authenticated can insert products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update products" on public.products;
create policy "authenticated can update products"
  on public.products for update
  to authenticated
  using (true) with check (true);

drop policy if exists "authenticated can delete products" on public.products;
create policy "authenticated can delete products"
  on public.products for delete
  to authenticated
  using (true);

-- ── Storage bucket for product photos ───────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Public read of images; only authenticated admins can upload / replace / delete.
drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "authenticated can upload product images" on storage.objects;
create policy "authenticated can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "authenticated can update product images" on storage.objects;
create policy "authenticated can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "authenticated can delete product images" on storage.objects;
create policy "authenticated can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ============================================================================
-- Create your admin login:
--   Supabase dashboard → Authentication → Users → "Add user"
--   Enter the owner's email + a strong password, and tick "Auto Confirm".
-- That email/password is what the client uses on /admin/login.
-- (Optional) Disable public sign-ups: Authentication → Providers → Email →
--   turn OFF "Enable Sign Ups", so only users you add can ever log in.
-- ============================================================================
