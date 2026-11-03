-- ─────────────────────────────────────────────────────────────────
-- SECURITY: lock down roles and row-level security.
--
-- Fixes three ways a stranger could reach customer inquiries or
-- edit the catalogue:
--   1. handle_new_user() trusted the `role` sent in sign-up metadata,
--      which the caller controls. New accounts now always start as 'User'.
--   2. Any signed-in user could change their own `role`. Role and
--      department changes now require an admin (or the service role /
--      SQL editor).
--   3. Inquiries and catalogue writes were open to ANY authenticated
--      user. They now require a staff role.
--
-- Written defensively because the live database differs from
-- schema.sql: tables that don't exist are skipped, and ALL existing
-- policies on the secured tables are replaced (Postgres ORs permissive
-- policies together, so one leftover "authenticated can do anything"
-- policy would silently undo this).
--
-- Idempotent. Run the whole file in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────

-- 1. Role helpers ─────────────────────────────────────────────────
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

-- Anyone allowed into the admin area (mirrors src/lib/permissions.ts).
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid()
       and role in (
         'Dev', 'Admin', 'CEO', 'GM',
         'Finance_Manager', 'Operations_Manager',
         'Sales_Manager', 'PR_Manager'
       )
  );
$$;

-- 2. New users never pick their own role ─────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'User'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Block self-promotion ─────────────────────────────────────────
-- API callers (anon / authenticated) may only change role or
-- department if they are an admin. The service role (edge functions)
-- and the SQL editor (postgres) are not restricted. Uses jsonb so it
-- works whether or not the department column exists.
-- MUST be security invoker: under security definer, current_user would
-- be the function owner and the check would never fire.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  n jsonb := to_jsonb(new);
  o jsonb := to_jsonb(old);
begin
  if current_user in ('anon', 'authenticated')
     and (n->'role' is distinct from o->'role'
          or n->'department' is distinct from o->'department')
     and not public.is_admin()
  then
    raise exception 'Only an admin can change role or department'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- 4. Replace every policy on the secured tables with a known set ──
do $$
declare
  r record;
  t text;
  catalogue text[] := array['brands', 'products', 'departments', 'collections', 'company_info'];
  secured   text[] := catalogue || array['inquiries', 'profiles'];
begin
  -- 4a. Drop all existing policies on these tables.
  for r in
    select tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename = any (secured)
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;

  -- 4b. Catalogue: anyone can read, only Dev/Admin can write.
  foreach t in array catalogue loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('create policy "public read %s" on public.%I for select using (true)', t, t);
      execute format(
        'create policy "admin write %s" on public.%I for all
           using (public.is_admin()) with check (public.is_admin())', t, t);
    end if;
  end loop;

  -- 4c. Inquiries: the contact form can insert; only staff can read or update.
  if to_regclass('public.inquiries') is not null then
    alter table public.inquiries enable row level security;
    create policy "public insert inquiries" on public.inquiries
      for insert with check (true);
    create policy "staff read inquiries" on public.inquiries
      for select using (public.is_staff());
    create policy "staff update inquiries" on public.inquiries
      for update using (public.is_staff()) with check (public.is_staff());
    create policy "admin delete inquiries" on public.inquiries
      for delete using (public.is_admin());
  end if;

  -- 4d. Profiles: everyone reads/updates their own row (role changes are
  --     blocked by the trigger above); Dev/Admin manage everyone.
  alter table public.profiles enable row level security;
  create policy "self read profile" on public.profiles
    for select using (auth.uid() = id);
  create policy "self update profile" on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);
  create policy "admin read profiles" on public.profiles
    for select using (public.is_admin());
  create policy "admin write profiles" on public.profiles
    for all using (public.is_admin()) with check (public.is_admin());
end$$;

-- 5. Audit ────────────────────────────────────────────────────────
-- (a) The policies now in force on the secured tables.
select tablename, policyname, cmd
  from pg_policies
 where schemaname = 'public'
   and tablename in ('brands', 'products', 'departments', 'collections',
                     'company_info', 'inquiries', 'profiles')
 order by tablename, policyname;

-- (b) Everyone who currently holds a staff role.
--     Remove anyone you do not recognise.
select id, email, role
  from public.profiles
 where role <> 'User'
 order by role, email;
