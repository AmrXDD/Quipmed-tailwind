-- ────────────────────────────────────────────────────────────────
-- QuipMed · Supabase schema
-- Run in Supabase SQL editor (or via `supabase db push`) before seeding.
-- ────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── COLLECTIONS ─────────────────────────────────────────────────
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  sort_order  integer default 100,
  created_at  timestamptz default now()
);

create index if not exists collections_sort_idx on public.collections(sort_order);

-- ── BRANDS ──────────────────────────────────────────────────────
create table if not exists public.brands (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  tagline       text,
  description   text,
  logo_url      text,
  website       text,
  country       text,
  sort_order    integer default 100,
  created_at    timestamptz default now()
);

-- ── PRODUCTS ────────────────────────────────────────────────────
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text not null,          -- "Diagnostic Imaging", "Surgical Solutions", …
  subcategory   text,                   -- "MRI", "Ultrasound", …
  brand_id      uuid references public.brands(id) on delete set null,
  brand_name    text,                   -- denormalised for fast lists
  collection_id uuid references public.collections(id) on delete set null,
  description   text,
  features      jsonb default '[]'::jsonb,
  specs         jsonb default '{}'::jsonb,
  image_url     text,
  source_url    text,
  featured      boolean default false,
  sort_order    integer default 100,
  created_at    timestamptz default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_brand_idx    on public.products(brand_id);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists products_collection_idx on public.products(collection_id);

-- ── PROFILES (linked to auth.users) ─────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'user',
  updated_at  timestamptz default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- ── COMPANY INFO (key/value for easy editing) ───────────────────
create table if not exists public.company_info (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz default now()
);

-- ── INQUIRIES (Contact form) ────────────────────────────────────
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  phone       text,
  company     text,
  subject     text,
  message     text not null,
  source      text default 'website',
  status      text default 'new',       -- new | read | replied | archived
  created_at  timestamptz default now()
);

create index if not exists inquiries_status_idx on public.inquiries(status);
create index if not exists inquiries_created_idx on public.inquiries(created_at desc);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────
alter table public.brands       enable row level security;
alter table public.products     enable row level security;
alter table public.collections  enable row level security;
alter table public.profiles     enable row level security;
alter table public.company_info enable row level security;
alter table public.inquiries    enable row level security;

-- Collections: public read, authenticated admin write
drop policy if exists "public read collections"  on public.collections;
drop policy if exists "auth write collections"   on public.collections;
create policy "public read collections"
  on public.collections for select using (true);
create policy "auth write collections"
  on public.collections for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Profiles: user can read/update their own row; admins can read all
drop policy if exists "self read profile"   on public.profiles;
drop policy if exists "self update profile" on public.profiles;
create policy "self read profile"
  on public.profiles for select using (auth.uid() = id);
create policy "self update profile"
  on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Public can READ the site catalog.
drop policy if exists "public read brands"       on public.brands;
drop policy if exists "public read products"     on public.products;
drop policy if exists "public read company_info" on public.company_info;
create policy "public read brands"
  on public.brands for select using (true);
create policy "public read products"
  on public.products for select using (true);
create policy "public read company_info"
  on public.company_info for select using (true);

-- Public can WRITE inquiries (contact form). No reading.
drop policy if exists "public write inquiries" on public.inquiries;
create policy "public write inquiries"
  on public.inquiries for insert with check (true);

-- Authenticated staff can READ/UPDATE inquiries.
drop policy if exists "auth read inquiries"    on public.inquiries;
drop policy if exists "auth update inquiries"  on public.inquiries;
create policy "auth read inquiries"
  on public.inquiries for select using (auth.role() = 'authenticated');
create policy "auth update inquiries"
  on public.inquiries for update using (auth.role() = 'authenticated');

-- Authenticated staff can mutate catalog.
drop policy if exists "auth write brands"       on public.brands;
drop policy if exists "auth write products"     on public.products;
drop policy if exists "auth write company_info" on public.company_info;
create policy "auth write brands"
  on public.brands for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "auth write products"
  on public.products for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "auth write company_info"
  on public.company_info for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────────
-- MIGRATION BLOCK (idempotent — safe to run on existing DB)
-- Run this in Supabase SQL editor to sync an older live database.
-- ────────────────────────────────────────────────────────────────

-- 1. Collections table
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  sort_order  integer default 100,
  created_at  timestamptz default now()
);

alter table public.collections enable row level security;

drop policy if exists "public read collections" on public.collections;
drop policy if exists "auth write collections"  on public.collections;
create policy "public read collections"
  on public.collections for select using (true);
create policy "auth write collections"
  on public.collections for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2. Add collection_id column to products
alter table public.products
  add column if not exists collection_id uuid references public.collections(id) on delete set null;

create index if not exists products_collection_idx on public.products(collection_id);

-- 3. Add role column to profiles (profiles table already exists)
alter table public.profiles
  add column if not exists role text not null default 'user';

create index if not exists profiles_role_idx on public.profiles(role);

-- 4. Optional — promote a user to admin:
-- update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID-HERE';

-- ────────────────────────────────────────────────────────────────
-- MIGRATION BLOCK · brands
-- Idempotent — safe on live DB. Creates brands if missing, ensures
-- logo_url column exists, adds brand_id FK on products.
-- ────────────────────────────────────────────────────────────────

-- 1. Brands table (minimal shape: id, name, logo_url)
create table if not exists public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  logo_url   text,
  slug       text unique,
  sort_order integer default 100,
  created_at timestamptz default now()
);

-- If the table existed with older columns, make sure logo_url is present
alter table public.brands add column if not exists logo_url text;
alter table public.brands add column if not exists sort_order integer default 100;

alter table public.brands enable row level security;

drop policy if exists "public read brands" on public.brands;
drop policy if exists "auth write brands"  on public.brands;
create policy "public read brands"
  on public.brands for select using (true);
create policy "auth write brands"
  on public.brands for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2. Add brand_id FK on products (if missing)
alter table public.products
  add column if not exists brand_id uuid references public.brands(id) on delete set null;

create index if not exists products_brand_idx on public.products(brand_id);

-- 3. Storage bucket for brand logos (run once in Supabase Dashboard → Storage,
-- or via SQL):
--   insert into storage.buckets (id, name, public) values ('brand-logos', 'brand-logos', true);

-- ────────────────────────────────────────────────────────────────
-- MIGRATION BLOCK · employees / roles / departments
-- Idempotent. Uses TEXT + CHECK (not an ENUM) so future role changes
-- do not require `alter type … add value` ceremony.
-- ────────────────────────────────────────────────────────────────

-- 1. Ensure profiles has full_name / role / department / email columns
alter table public.profiles
  add column if not exists full_name  text;
alter table public.profiles
  add column if not exists role       text not null default 'User';
alter table public.profiles
  add column if not exists department text;                -- 'Medical' | 'Dental' | null
alter table public.profiles
  add column if not exists email      text;                -- denormalised for listing

-- 2. Constrain role to the allowed set (drop old constraint first)
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in (
    'Dev', 'Admin', 'CEO', 'GM',
    'Finance_Manager', 'Operations_Manager',
    'Sales_Manager', 'PR_Manager',
    'User'
  ));

-- 3. Constrain department (optional — null allowed for non-managers)
alter table public.profiles
  drop constraint if exists profiles_department_check;
alter table public.profiles
  add constraint profiles_department_check
  check (department is null or department in ('Medical', 'Dental'));

-- 4. Add department to products so manager-scoped filtering works
alter table public.products
  add column if not exists department text;
alter table public.products
  drop constraint if exists products_department_check;
alter table public.products
  add constraint products_department_check
  check (department is null or department in ('Medical', 'Dental'));

create index if not exists products_department_idx on public.products(department);

-- 5. Trigger that auto-provisions a profile row when a new auth user is
--    created (including via inviteUserByEmail). Reads role / department /
--    full_name from the invite's user_metadata so the invited user lands
--    with the correct role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'User'),
    nullif(new.raw_user_meta_data->>'department', '')
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        role       = coalesce(excluded.role,      public.profiles.role),
        department = coalesce(excluded.department, public.profiles.department);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. RLS — admins/devs can read & update any profile; everyone reads & updates self.
drop policy if exists "self read profile"    on public.profiles;
drop policy if exists "self update profile"  on public.profiles;
drop policy if exists "admin read profiles"  on public.profiles;
drop policy if exists "admin write profiles" on public.profiles;

create policy "self read profile"
  on public.profiles for select using (auth.uid() = id);

create policy "self update profile"
  on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Helper to check if a JWT belongs to an admin-level role
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid()
       and role in ('Dev', 'Admin')
  );
$$;

create policy "admin read profiles"
  on public.profiles for select using (public.is_admin());

create policy "admin write profiles"
  on public.profiles for all using (public.is_admin())
  with check (public.is_admin());

-- 7. Promote yourself once:
-- update public.profiles set role = 'Dev' where id = 'YOUR-USER-UUID-HERE';

-- ────────────────────────────────────────────────────────────────
-- MIGRATION BLOCK · Collections → Departments + brands.website_link
-- Idempotent. Safe to run on a live DB.
-- ────────────────────────────────────────────────────────────────

-- 1. Rename the collections table to departments (and its FK) if it still
--    exists under the old name.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'collections'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'departments'
  ) then
    alter table public.collections rename to departments;
  end if;
end$$;

-- Fallback: ensure the table exists under the new name
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  sort_order  integer default 100,
  created_at  timestamptz default now()
);

create index if not exists departments_sort_idx on public.departments(sort_order);

-- 2. Rename products.collection_id → products.department_id
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'products'
      and column_name  = 'collection_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'products'
      and column_name  = 'department_id'
  ) then
    alter table public.products rename column collection_id to department_id;
  end if;
end$$;

alter table public.products
  add column if not exists department_id uuid references public.departments(id) on delete set null;

create index if not exists products_department_id_idx on public.products(department_id);

-- 3. Replay RLS under the new name
alter table public.departments enable row level security;

drop policy if exists "public read collections"  on public.departments;
drop policy if exists "auth write collections"   on public.departments;
drop policy if exists "public read departments"  on public.departments;
drop policy if exists "auth write departments"   on public.departments;

create policy "public read departments"
  on public.departments for select using (true);
create policy "auth write departments"
  on public.departments for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. brands.website_link (optional external URL shown on storefront cards)
alter table public.brands
  add column if not exists website_link text;
