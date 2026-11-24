-- =============================================================
-- 0003_seed_defaults.sql  –  Ruang Pribadi: auto-seed on new user
-- =============================================================
-- Trigger fires on every new auth.users row and seeds:
--   • profiles (1 row)
--   • wallets  (1 default: Kas / cash)
--   • categories (10 defaults across expense / income / task)
-- =============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_user_id uuid := new.id;
begin

  -- ── Profile ─────────────────────────────────────────────────
  insert into profiles (user_id, display_name)
  values (v_user_id, coalesce(new.raw_user_meta_data->>'full_name', null));

  -- ── Default wallet ──────────────────────────────────────────
  insert into wallets (user_id, name, type, initial_balance)
  values (v_user_id, 'Kas', 'cash', 0);

  -- ── Default EXPENSE categories ───────────────────────────────
  insert into categories (user_id, kind, name, color, icon, sort_order) values
    (v_user_id, 'expense', 'Makan',      '#f97316', 'utensils',      1),
    (v_user_id, 'expense', 'Transport',  '#3b82f6', 'car',           2),
    (v_user_id, 'expense', 'Tagihan',    '#a855f7', 'receipt',       3),
    (v_user_id, 'expense', 'Hiburan',    '#ec4899', 'gamepad-2',     4),
    (v_user_id, 'expense', 'Belanja',    '#14b8a6', 'shopping-bag',  5),
    (v_user_id, 'expense', 'Kesehatan',  '#22c55e', 'heart-pulse',   6),
    (v_user_id, 'expense', 'Lainnya',    '#6b7280', 'more-horizontal',7);

  -- ── Default INCOME categories ────────────────────────────────
  insert into categories (user_id, kind, name, color, icon, sort_order) values
    (v_user_id, 'income', 'Gaji',      '#22c55e', 'banknote',  1),
    (v_user_id, 'income', 'Freelance', '#f59e0b', 'laptop',    2),
    (v_user_id, 'income', 'Lainnya',   '#6b7280', 'circle-dot',3);

  -- ── Default TASK categories ──────────────────────────────────
  insert into categories (user_id, kind, name, color, icon, sort_order) values
    (v_user_id, 'task', 'Kerjaan', '#3b82f6', 'briefcase', 1),
    (v_user_id, 'task', 'Kuliah',  '#8b5cf6', 'book-open', 2),
    (v_user_id, 'task', 'Pribadi', '#ec4899', 'user',      3);

  return new;
end;
$$;

-- Attach trigger to auth.users (runs after every new signup)
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
