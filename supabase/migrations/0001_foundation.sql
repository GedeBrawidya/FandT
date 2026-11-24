-- =============================================================
-- 0001_foundation.sql  –  Ruang Pribadi: full schema + RLS + indexes + triggers
-- =============================================================

-- ─── PROFILES ────────────────────────────────────────────────
create table profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  display_name    text,
  timezone        text not null default 'Asia/Jakarta',
  period_start_day int not null default 1 check (period_start_day between 1 and 28),
  theme           text not null default 'dark'
);

-- ─── WALLETS ─────────────────────────────────────────────────
create table wallets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  name            text not null,
  type            text not null check (type in ('cash','bank','ewallet')),
  initial_balance bigint not null default 0,
  is_archived     bool not null default false
);

-- ─── CATEGORIES ──────────────────────────────────────────────
create table categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  kind        text not null check (kind in ('expense','income','task')),
  name        text not null,
  color       text not null default '#6366f1',
  icon        text not null default 'circle',
  sort_order  int not null default 0,
  is_archived bool not null default false
);

-- ─── BILLS ───────────────────────────────────────────────────
create table bills (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null,
  amount      bigint not null,
  due_day     int,
  due_date    date,
  recurrence  text not null default 'monthly' check (recurrence in ('none','monthly')),
  category_id uuid references categories,
  is_active   bool not null default true
);

-- ─── TRANSACTIONS ─────────────────────────────────────────────
create table transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  type         text not null check (type in ('income','expense','transfer')),
  amount       bigint not null check (amount > 0),
  wallet_id    uuid references wallets,
  to_wallet_id uuid references wallets,
  category_id  uuid references categories,
  bill_id      uuid,
  occurred_on  date not null,
  note         text,
  deleted_at   timestamptz
);

-- ─── BILL_PAYMENTS ───────────────────────────────────────────
create table bill_payments (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  bill_id        uuid not null references bills,
  period_start   date not null,
  transaction_id uuid references transactions,
  paid_at        timestamptz not null default now()
);

-- ─── RECURRING_INCOMES ───────────────────────────────────────
create table recurring_incomes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text not null,
  amount       bigint not null,
  day_of_month int not null,
  wallet_id    uuid references wallets,
  is_active    bool not null default true
);

-- ─── BUDGET_PERIODS ──────────────────────────────────────────
create table budget_periods (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  start_date      date not null,
  end_date        date not null,
  savings_target  bigint not null default 0,
  note            text
);

-- ─── TASKS ───────────────────────────────────────────────────
create table tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  title           text not null,
  notes           text,
  type            text not null default 'task' check (type in ('task','note')),
  category_id     uuid references categories,
  priority        text not null default 'med' check (priority in ('low','med','high')),
  status          text not null default 'todo' check (status in ('todo','doing','done')),
  due_at          timestamptz,
  all_day         bool not null default true,
  completed_at    timestamptz,
  recurrence_rule text,
  google_event_id text,
  sort_order      int not null default 0,
  deleted_at      timestamptz
);

-- ─── SUBTASKS ────────────────────────────────────────────────
-- No user_id: ownership is inherited from the parent task
create table subtasks (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  task_id    uuid not null references tasks on delete cascade,
  title      text not null,
  is_done    bool not null default false,
  sort_order int not null default 0
);

-- ─── EVENTS ──────────────────────────────────────────────────
create table events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  title           text not null,
  description     text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  all_day         bool not null default false,
  google_event_id text
);

-- ─── GOOGLE_CONNECTIONS ───────────────────────────────────────
create table google_connections (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users on delete cascade,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  google_email            text not null,
  refresh_token_encrypted text,
  calendar_id             text,
  status                  text not null default 'active',
  last_synced_at          timestamptz
);

-- ─── WISHLIST_ITEMS ──────────────────────────────────────────
create table wishlist_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text not null,
  image_path   text,
  target_price bigint not null,
  url          text,
  priority     int not null default 0,
  status       text not null default 'impian' check (status in ('impian','menabung','tercapai')),
  note         text,
  achieved_at  timestamptz
);

-- ─── WISHLIST_CONTRIBUTIONS ──────────────────────────────────
create table wishlist_contributions (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  item_id        uuid not null references wishlist_items on delete cascade,
  amount         bigint not null check (amount > 0),
  contributed_on date not null
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- profiles
alter table profiles enable row level security;
create policy "own_profiles" on profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- wallets
alter table wallets enable row level security;
create policy "own_wallets" on wallets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- categories
alter table categories enable row level security;
create policy "own_categories" on categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- bills
alter table bills enable row level security;
create policy "own_bills" on bills
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- transactions
alter table transactions enable row level security;
create policy "own_transactions" on transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- bill_payments (no user_id; ownership via bill)
alter table bill_payments enable row level security;
create policy "own_bill_payments" on bill_payments
  for all using (
    bill_id in (select id from bills where user_id = auth.uid())
  );

-- recurring_incomes
alter table recurring_incomes enable row level security;
create policy "own_recurring_incomes" on recurring_incomes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- budget_periods
alter table budget_periods enable row level security;
create policy "own_budget_periods" on budget_periods
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- tasks
alter table tasks enable row level security;
create policy "own_tasks" on tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- subtasks (no user_id; ownership via task)
alter table subtasks enable row level security;
create policy "own_subtasks" on subtasks
  for all using (
    task_id in (select id from tasks where user_id = auth.uid())
  );

-- events
alter table events enable row level security;
create policy "own_events" on events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- google_connections: service role reads; user can insert/update/delete own rows
alter table google_connections enable row level security;
create policy "own_google_connections_write" on google_connections
  for insert with check (user_id = auth.uid());
create policy "own_google_connections_modify" on google_connections
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own_google_connections_delete" on google_connections
  for delete using (user_id = auth.uid());

-- wishlist_items
alter table wishlist_items enable row level security;
create policy "own_wishlist_items" on wishlist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- wishlist_contributions (no user_id; ownership via wishlist_item)
alter table wishlist_contributions enable row level security;
create policy "own_wishlist_contributions" on wishlist_contributions
  for all using (
    item_id in (select id from wishlist_items where user_id = auth.uid())
  );

-- =============================================================
-- INDEXES
-- =============================================================

create index on transactions (user_id, occurred_on);
create index on tasks        (user_id, due_at);
create index on transactions (wallet_id);
create index on transactions (deleted_at) where deleted_at is null;

-- =============================================================
-- UPDATED_AT TRIGGER
-- =============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_wallets_updated_at
  before update on wallets
  for each row execute function set_updated_at();

create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

create trigger trg_bills_updated_at
  before update on bills
  for each row execute function set_updated_at();

create trigger trg_transactions_updated_at
  before update on transactions
  for each row execute function set_updated_at();

create trigger trg_bill_payments_updated_at
  before update on bill_payments
  for each row execute function set_updated_at();

create trigger trg_recurring_incomes_updated_at
  before update on recurring_incomes
  for each row execute function set_updated_at();

create trigger trg_budget_periods_updated_at
  before update on budget_periods
  for each row execute function set_updated_at();

create trigger trg_tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

create trigger trg_subtasks_updated_at
  before update on subtasks
  for each row execute function set_updated_at();

create trigger trg_events_updated_at
  before update on events
  for each row execute function set_updated_at();

create trigger trg_google_connections_updated_at
  before update on google_connections
  for each row execute function set_updated_at();

create trigger trg_wishlist_items_updated_at
  before update on wishlist_items
  for each row execute function set_updated_at();

create trigger trg_wishlist_contributions_updated_at
  before update on wishlist_contributions
  for each row execute function set_updated_at();
