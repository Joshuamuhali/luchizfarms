-- Luchiz Farm: profiles, order workflow, RLS
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();

-- Order status workflow
alter table if exists public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table if exists public.orders
  alter column status set default 'placed';

-- Ensure status allows workflow values (adjust if your column is enum)
comment on column public.orders.status is 'placed | packaging | ready_for_payment | paid | delivered | cancelled';

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- RLS helpers
create or replace function public.is_admin ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles RLS
alter table public.profiles enable row level security;

drop policy if exists "Profiles: read own" on public.profiles;
create policy "Profiles: read own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Orders RLS
alter table public.orders enable row level security;

drop policy if exists "Orders: customer insert" on public.orders;
create policy "Orders: customer insert"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Orders: customer read own" on public.orders;
create policy "Orders: customer read own"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Orders: customer update own (limited)" on public.orders;
create policy "Orders: customer update own (limited)"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Orders: admin all" on public.orders;
create policy "Orders: admin all"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- Order items RLS
alter table public.order_items enable row level security;

drop policy if exists "Order items: read via order" on public.order_items;
create policy "Order items: read via order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Order items: insert with order" on public.order_items;
create policy "Order items: insert with order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- Products & categories: public read (if not already)
alter table public.products enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Products: public read" on public.products;
create policy "Products: public read"
  on public.products for select
  using (is_active = true or public.is_admin());

drop policy if exists "Categories: public read" on public.categories;
create policy "Categories: public read"
  on public.categories for select
  using (is_active = true or public.is_admin());

-- Make first admin (replace email after signup):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
