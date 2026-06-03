-- =============================================================================
-- Luchiz Farm — Admin Extensions Migration
-- Run in: Supabase Dashboard → SQL Editor → New query
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Stock adjustment history
-- -----------------------------------------------------------------------------
create table if not exists public.stock_adjustments (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  admin_id      uuid references auth.users(id) on delete set null,
  previous_qty  int not null,
  new_qty       int not null,
  delta         int generated always as (new_qty - previous_qty) stored,
  reason        text,
  created_at    timestamptz not null default now()
);
create index if not exists stock_adj_product_idx on public.stock_adjustments(product_id);
create index if not exists stock_adj_created_idx on public.stock_adjustments(created_at desc);

-- -----------------------------------------------------------------------------
-- 2. Order admin notes (internal)
-- -----------------------------------------------------------------------------
create table if not exists public.order_notes (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  admin_id   uuid references auth.users(id) on delete set null,
  note       text not null,
  created_at timestamptz not null default now()
);
create index if not exists order_notes_order_idx on public.order_notes(order_id);

-- -----------------------------------------------------------------------------
-- 3. Price history
-- -----------------------------------------------------------------------------
create table if not exists public.price_history (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  admin_id      uuid references auth.users(id) on delete set null,
  previous_price numeric(12,2),
  new_price      numeric(12,2),
  created_at    timestamptz not null default now()
);
create index if not exists price_hist_product_idx on public.price_history(product_id);

-- -----------------------------------------------------------------------------
-- 4. Activity / audit log
-- -----------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id         uuid primary key default gen_random_uuid(),
  admin_id   uuid references auth.users(id) on delete set null,
  action     text not null,   -- e.g. 'update_stock', 'update_order_status', 'update_price'
  entity     text not null,   -- e.g. 'product', 'order', 'user'
  entity_id  text,
  meta       jsonb,           -- arbitrary context
  created_at timestamptz not null default now()
);
create index if not exists activity_admin_idx on public.activity_logs(admin_id);
create index if not exists activity_created_idx on public.activity_logs(created_at desc);

-- -----------------------------------------------------------------------------
-- 5. User notes (customer support)
-- -----------------------------------------------------------------------------
create table if not exists public.user_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  admin_id   uuid references auth.users(id) on delete set null,
  note       text not null,
  created_at timestamptz not null default now()
);
create index if not exists user_notes_user_idx on public.user_notes(user_id);

-- -----------------------------------------------------------------------------
-- 6. Add suspended column to profiles
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_suspended boolean not null default false,
  add column if not exists suspension_reason text,
  add column if not exists customer_tag text default 'retail'
    check (customer_tag in ('retail', 'wholesale', 'vip', 'inactive'));

-- -----------------------------------------------------------------------------
-- 7. Add admin_notes column to orders
-- -----------------------------------------------------------------------------
alter table public.orders
  add column if not exists cancelled_reason text,
  add column if not exists refund_status text default 'none'
    check (refund_status in ('none', 'requested', 'approved', 'processed'));

-- -----------------------------------------------------------------------------
-- RLS for new tables — admin only
-- -----------------------------------------------------------------------------
alter table public.stock_adjustments enable row level security;
alter table public.order_notes enable row level security;
alter table public.price_history enable row level security;
alter table public.activity_logs enable row level security;
alter table public.user_notes enable row level security;

-- Stock adjustments: admin full access
drop policy if exists "stock_adj_admin" on public.stock_adjustments;
create policy "stock_adj_admin" on public.stock_adjustments
  for all using (public.is_admin()) with check (public.is_admin());

-- Order notes: admin full access
drop policy if exists "order_notes_admin" on public.order_notes;
create policy "order_notes_admin" on public.order_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- Price history: admin full access
drop policy if exists "price_hist_admin" on public.price_history;
create policy "price_hist_admin" on public.price_history
  for all using (public.is_admin()) with check (public.is_admin());

-- Activity logs: admin read only (inserts done via service role or triggers)
drop policy if exists "activity_admin_read" on public.activity_logs;
create policy "activity_admin_read" on public.activity_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- User notes: admin full access
drop policy if exists "user_notes_admin" on public.user_notes;
create policy "user_notes_admin" on public.user_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- Suspended users cannot sign in (handled in app layer via profile check)
-- Optionally add RLS to products: suspended users see nothing
-- (optional, handle in app layer for now)
