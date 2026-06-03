-- Luchiz Farm: base tables (run first on a new Supabase project)
-- Safe to run: uses IF NOT EXISTS

create extension if not exists "pgcrypto";

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text not null default 'Leaf',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text,
  price numeric(12, 2),
  unit text not null default 'kg',
  image_url text,
  image_urls text[],
  stock_quantity int not null default 0,
  low_stock_threshold int not null default 5,
  is_market_price boolean not null default false,
  market_note text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  status text not null default 'placed',
  payment_status text not null default 'pending',
  delivery_address text,
  delivery_notes text,
  total numeric(12, 2) not null default 0,
  has_market_items boolean not null default false,
  whatsapp_sent boolean not null default false,
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order line items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  product_name text,
  qty int not null check (qty > 0),
  unit_price numeric(12, 2),
  unit text not null,
  subtotal numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- Seed categories (optional starter data)
insert into public.categories (name, slug, icon, sort_order)
values
  ('Fresh Vegetables', 'fresh-vegetables', 'Leaf', 1),
  ('Meat & Poultry', 'meat-poultry', 'Beef', 2)
on conflict (slug) do nothing;
