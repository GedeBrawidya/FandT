-- =============================================================
-- 0002_rpc.sql  –  Ruang Pribadi: Postgres RPC functions
-- =============================================================

-- ─── 1. get_daily_allowance ──────────────────────────────────
-- Returns budget breakdown and daily allowance for a given date.
create or replace function get_daily_allowance(
  p_user_id uuid,
  p_date    date
)
returns table (
  budget_variabel    bigint,
  sisa_budget        bigint,
  sisa_hari          int,
  jatah_harian       bigint,
  terpakai_hari_ini  bigint,
  sisa_hari_ini      bigint
)
security definer
language plpgsql
as $$
declare
  v_period               budget_periods%rowtype;
  v_total_pemasukan      bigint;
  v_target_tabungan      bigint;
  v_tagihan_tetap_total  bigint;
  v_pengeluaran_variabel bigint;
  v_sisa_hari            int;
  v_budget_variabel      bigint;
  v_sisa_budget          bigint;
  v_jatah_harian         bigint;
  v_terpakai_hari_ini    bigint;
  v_sisa_hari_ini        bigint;
begin
  -- Find active budget period for the given date
  select * into v_period
  from budget_periods
  where user_id   = p_user_id
    and start_date <= p_date
    and end_date   >= p_date
  limit 1;

  -- No period → return all zeros
  if not found then
    return query select
      0::bigint, 0::bigint, 0::int,
      0::bigint, 0::bigint, 0::bigint;
    return;
  end if;

  -- Total income in the period
  select coalesce(sum(amount), 0) into v_total_pemasukan
  from transactions
  where user_id    = p_user_id
    and type       = 'income'
    and occurred_on between v_period.start_date and v_period.end_date
    and deleted_at is null;

  v_target_tabungan := v_period.savings_target;

  -- Fixed bills total
  select coalesce(sum(amount), 0) into v_tagihan_tetap_total
  from bills
  where user_id  = p_user_id
    and is_active = true;

  -- Variable expenses already spent (before today)
  select coalesce(sum(amount), 0) into v_pengeluaran_variabel
  from transactions
  where user_id    = p_user_id
    and type       = 'expense'
    and bill_id    is null
    and occurred_on >= v_period.start_date
    and occurred_on <  p_date
    and deleted_at  is null;

  -- Days remaining (including today)
  v_sisa_hari := (v_period.end_date - p_date)::int + 1;

  -- Budget calculations
  v_budget_variabel := v_total_pemasukan - v_target_tabungan - v_tagihan_tetap_total;
  v_sisa_budget     := v_budget_variabel - v_pengeluaran_variabel;
  v_jatah_harian    := case when v_sisa_hari > 0
                            then floor(v_sisa_budget::numeric / v_sisa_hari)::bigint
                            else 0 end;

  -- Variable expense spent today
  select coalesce(sum(amount), 0) into v_terpakai_hari_ini
  from transactions
  where user_id    = p_user_id
    and type       = 'expense'
    and bill_id    is null
    and occurred_on = p_date
    and deleted_at  is null;

  v_sisa_hari_ini := v_jatah_harian - v_terpakai_hari_ini;

  return query select
    v_budget_variabel,
    v_sisa_budget,
    v_sisa_hari,
    v_jatah_harian,
    v_terpakai_hari_ini,
    v_sisa_hari_ini;
end;
$$;

-- ─── 2. get_wallet_balances ──────────────────────────────────
-- Returns current balance for every wallet of the user.
create or replace function get_wallet_balances(
  p_user_id uuid
)
returns table (
  wallet_id uuid,
  name      text,
  type      text,
  balance   bigint
)
security definer
language plpgsql
as $$
begin
  return query
  select
    w.id as wallet_id,
    w.name,
    w.type,
    (
      w.initial_balance

      -- Income into this wallet
      + coalesce((
          select sum(t.amount)
          from transactions t
          where t.wallet_id  = w.id
            and t.type       = 'income'
            and t.deleted_at is null
        ), 0)

      -- Expense out of this wallet
      - coalesce((
          select sum(t.amount)
          from transactions t
          where t.wallet_id  = w.id
            and t.type       = 'expense'
            and t.deleted_at is null
        ), 0)

      -- Transfer received into this wallet
      + coalesce((
          select sum(t.amount)
          from transactions t
          where t.to_wallet_id = w.id
            and t.type         = 'transfer'
            and t.deleted_at   is null
        ), 0)

      -- Transfer sent out of this wallet
      - coalesce((
          select sum(t.amount)
          from transactions t
          where t.wallet_id  = w.id
            and t.type       = 'transfer'
            and t.deleted_at is null
        ), 0)

    )::bigint as balance

  from wallets w
  where w.user_id     = p_user_id
    and w.is_archived = false
  order by w.created_at;
end;
$$;

-- ─── 3. get_spending_by_category ─────────────────────────────
-- Returns total expenses grouped by category for a date range.
create or replace function get_spending_by_category(
  p_user_id uuid,
  p_start   date,
  p_end     date
)
returns table (
  category_id uuid,
  name        text,
  color       text,
  total       bigint
)
security definer
language plpgsql
as $$
begin
  return query
  select
    c.id    as category_id,
    c.name,
    c.color,
    coalesce(sum(t.amount), 0)::bigint as total
  from categories c
  left join transactions t
         on t.category_id  = c.id
        and t.type         = 'expense'
        and t.occurred_on  between p_start and p_end
        and t.deleted_at   is null
        and t.user_id      = p_user_id
  where c.user_id = p_user_id
    and c.kind    = 'expense'
  group by c.id, c.name, c.color
  order by total desc;
end;
$$;
