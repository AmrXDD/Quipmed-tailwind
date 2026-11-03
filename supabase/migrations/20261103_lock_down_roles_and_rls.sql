-- ─────────────────────────────────────────────────────────────────
-- SECURITY: lock down roles and row-level security.
--
-- Fixes three ways a stranger could reach customer inquiries or
-- edit the catalogue:
--   1. handle_new_user() trusted the `role` sent in sign-up metadata,
--      which the caller controls. New accounts now always start as 'User'.
--   2. "self update profile" let any signed-in user change their own
--      `role`. Role and department changes now require an admin
--      (or the service role / SQL editor).
--   3. Inquiries and catalogue writes were open to ANY authenticated
--      user. They now require a staff role.
--
-- Idempotent. Run in Supabase SQL editor or with `supabase db push`.
-- ─────────────────────────────────────────────────────────────────

-- 1. New users never pick their own role ─────────────────────────
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
    'User',
    null
  )
  on conflict (id) do update
    set email     = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
  return new;
end;
$$;

-- 2. Role helpers ─────────────────────────────────────────────────
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

-- 3. Block self-promotion ─────────────────────────────────────────
-- API callers (anon / authenticated) may only change role or
-- department if they are an admin. The service role (edge functions)
-- and the SQL editor (postgres) are not restricted.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated')
     and (new.role is distinct from old.role
          or new.department is distinct from old.department)
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

-- 4. Inquiries: staff only ────────────────────────────────────────
drop policy if exists "auth read inquiries"   on public.inquiries;
drop policy if exists "auth update inquiries" on public.inquiries;
drop policy if exists "staff read inquiries"   on public.inquiries;
drop policy if exists "staff update inquiries" on public.inquiries;

create policy "staff read inquiries"
  on public.inquiries for select using (public.is_staff());
create policy "staff update inquiries"
  on public.inquiries for update using (public.is_staff())
  with check (public.is_staff());

-- Public insert stays (the contact form needs it).

-- 5. Catalogue and company info: admins only ──────────────────────
drop policy if exists "auth write brands"        on public.brands;
drop policy if exists "auth write products"      on public.products;
drop policy if exists "auth write company_info"  on public.company_info;
drop policy if exists "auth write departments"   on public.departments;
drop policy if exists "admin write brands"       on public.brands;
drop policy if exists "admin write products"     on public.products;
drop policy if exists "admin write company_info" on public.company_info;
drop policy if exists "admin write departments"  on public.departments;

create policy "admin write brands"
  on public.brands for all using (public.is_admin())
  with check (public.is_admin());
create policy "admin write products"
  on public.products for all using (public.is_admin())
  with check (public.is_admin());
create policy "admin write company_info"
  on public.company_info for all using (public.is_admin())
  with check (public.is_admin());
create policy "admin write departments"
  on public.departments for all using (public.is_admin())
  with check (public.is_admin());

-- Legacy table, if it still exists under the old name.
do $$
begin
  if exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'collections'
  ) then
    execute 'drop policy if exists "auth write collections" on public.collections';
    execute 'drop policy if exists "admin write collections" on public.collections';
    execute 'create policy "admin write collections" on public.collections
               for all using (public.is_admin()) with check (public.is_admin())';
  end if;
end$$;

-- 6. Audit: list anyone who currently holds a staff role.
--    Check this list after running — remove anyone you do not recognise.
select id, email, role, department
  from public.profiles
 where role <> 'User'
 order by role, email;
