-- =============================================================
-- 0004_fix_oauth_trigger.sql  –  Fix Google OAuth Database Error
-- =============================================================
-- Run this script directly in the Supabase SQL Editor if you
-- encounter: "Database error saving new user" during OAuth login.
--
-- Fixes applied:
-- 1. Adds SET search_path = public, auth (critical for SECURITY DEFINER)
-- 2. Fully qualifies table names (public.profiles, public.wallets, public.categories)
-- 3. Provides robust fallback for user display name
-- 4. Guarantees unique constraint on profiles(user_id) for safe UPSERT
-- 5. Adds sub-transaction error safety so registration never crashes
-- =============================================================

-- Step 1: Ensure profiles table has unique constraint on user_id
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_user_id_key'
  ) then
    alter table public.profiles add constraint profiles_user_id_key unique (user_id);
  end if;
end $$;

-- Step 2: Create / replace handle_new_user function with search_path set
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := new.id;
  v_display_name text;
begin

  -- Extract display name from metadata (Google OAuth provides full_name or name)
  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'User'
  );

  -- 1. Insert Profile
  begin
    insert into public.profiles (user_id, display_name)
    values (v_user_id, v_display_name)
    on conflict (user_id) do update
      set display_name = coalesce(public.profiles.display_name, excluded.display_name);
  exception when others then
    raise warning 'handle_new_user: error inserting into profiles: %', sqlerrm;
  end;

  -- 2. Insert Default Wallet
  begin
    if not exists (select 1 from public.wallets where user_id = v_user_id) then
      insert into public.wallets (user_id, name, type, initial_balance)
      values (v_user_id, 'Kas', 'cash', 0);
    end if;
  exception when others then
    raise warning 'handle_new_user: error inserting into wallets: %', sqlerrm;
  end;

  -- 3. Insert Default Categories
  begin
    -- Expense categories
    if not exists (select 1 from public.categories where user_id = v_user_id and kind = 'expense') then
      insert into public.categories (user_id, kind, name, color, icon, sort_order) values
        (v_user_id, 'expense', 'Makan',      '#f97316', 'utensils',       1),
        (v_user_id, 'expense', 'Transport',  '#3b82f6', 'car',            2),
        (v_user_id, 'expense', 'Tagihan',    '#a855f7', 'receipt',        3),
        (v_user_id, 'expense', 'Hiburan',    '#ec4899', 'gamepad-2',      4),
        (v_user_id, 'expense', 'Belanja',    '#14b8a6', 'shopping-bag',   5),
        (v_user_id, 'expense', 'Kesehatan',  '#22c55e', 'heart-pulse',    6),
        (v_user_id, 'expense', 'Lainnya',    '#6b7280', 'more-horizontal', 7);
    end if;

    -- Income categories
    if not exists (select 1 from public.categories where user_id = v_user_id and kind = 'income') then
      insert into public.categories (user_id, kind, name, color, icon, sort_order) values
        (v_user_id, 'income', 'Gaji',      '#22c55e', 'banknote',   1),
        (v_user_id, 'income', 'Freelance', '#f59e0b', 'laptop',     2),
        (v_user_id, 'income', 'Lainnya',   '#6b7280', 'circle-dot', 3);
    end if;

    -- Task categories
    if not exists (select 1 from public.categories where user_id = v_user_id and kind = 'task') then
      insert into public.categories (user_id, kind, name, color, icon, sort_order) values
        (v_user_id, 'task', 'Kerjaan', '#3b82f6', 'briefcase', 1),
        (v_user_id, 'task', 'Kuliah',  '#8b5cf6', 'book-open', 2),
        (v_user_id, 'task', 'Pribadi', '#ec4899', 'user',      3);
    end if;
  exception when others then
    raise warning 'handle_new_user: error inserting into categories: %', sqlerrm;
  end;

  return new;
end;
$$;

-- Step 3: Recreate trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Step 4: Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.profiles to postgres, anon, authenticated, service_role;
grant all on table public.wallets to postgres, anon, authenticated, service_role;
grant all on table public.categories to postgres, anon, authenticated, service_role;
grant execute on function public.handle_new_user() to postgres, anon, authenticated, service_role;
