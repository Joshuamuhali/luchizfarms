-- =============================================================================
-- Luchiz Farm — FULL FINAL SCHEMA
-- Run once in Supabase Dashboard → SQL → New query
-- Requires: Supabase project with Auth (Email) enabled
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMS (documented as CHECK constraints on text columns)
-- orders.status: placed | packaging | ready_for_payment | paid | delivered | cancelled
-- orders.payment_status: pending | paid | failed | refunded
-- profiles.role: customer | admin
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------

-- Product categories (app filters by slug: fresh-vegetables, meat-poultry)
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text not null default 'Leaf',
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.categories is 'Shop tabs: vegetables, meat & poultry';
comment on column public.categories.slug is 'Used in app: fresh-vegetables | meat-poultry';

-- Products — image_url = public URL from Storage bucket "products"
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  category_id         uuid not null references public.categories (id) on delete restrict,
  description         text,
  price               numeric(12, 2),          -- null when is_market_price = true
  unit                text not null default 'kg',
  image_url           text,                    -- paste Supabase Storage public URL here
  image_urls          text[],                  -- optional extra gallery URLs
  stock_quantity      int not null default 0,
  low_stock_threshold int not null default 5,
  is_market_price     boolean not null default false,
  market_note         text,                    -- e.g. "Market Price"
  is_active           boolean not null default true,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.products is 'Catalog; image_url from Storage bucket products';
comment on column public.products.image_url is 'Public URL: https://<project>.supabase.co/storage/v1/object/public/products/<file>';

-- Customer profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Extends Supabase Auth; set role=admin for farm staff';

-- Orders
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users (id) on delete set null,
  customer_name     text not null,
  customer_phone    text not null,
  status            text not null default 'placed'
                    check (status in (
                      'placed', 'packaging', 'ready_for_payment',
                      'paid', 'delivered', 'cancelled'
                    )),
  payment_status    text not null default 'pending'
                    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  delivery_address  text,
  delivery_notes    text,
  total             numeric(12, 2) not null default 0,
  has_market_items  boolean not null default false,
  whatsapp_sent     boolean not null default false,
  whatsapp_sent_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on column public.orders.status is 'Workflow: placed → packaging → ready_for_payment → paid → delivered';

-- Order line items (snapshot product_name/price at order time)
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete restrict,
  product_name  text,
  qty           int not null check (qty > 0),
  unit_price    numeric(12, 2),
  unit          text not null,
  subtotal      numeric(12, 2) not null default 0,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_is_active_idx on public.products (is_active) where is_active = true;
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- -----------------------------------------------------------------------------
-- TRIGGERS: updated_at
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- AUTH: auto-create profile on signup
-- -----------------------------------------------------------------------------

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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();

-- -----------------------------------------------------------------------------
-- RPC: customer sends order for packaging (placed → packaging only)
-- -----------------------------------------------------------------------------

create or replace function public.customer_submit_for_packaging (p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.orders;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into result from public.orders where id = p_order_id;

  if result.id is null then
    raise exception 'Order not found';
  end if;

  if result.user_id is distinct from auth.uid() then
    raise exception 'Not authorized';
  end if;

  if result.status <> 'placed' then
    raise exception 'Order is not in placed status';
  end if;

  update public.orders
  set status = 'packaging'
  where id = p_order_id
  returning * into result;

  return result;
end;
$$;

grant execute on function public.customer_submit_for_packaging (uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- RLS HELPER
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Categories: public read active; admin read all
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
  for select using (is_active = true or public.is_admin());

-- Products: public read active; admin full access for future CMS
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
  for select using (is_active = true or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Orders
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_write" on public.orders;
create policy "orders_admin_write" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- Order items (via parent order)
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- -----------------------------------------------------------------------------
-- STORAGE: product images (upload in Dashboard, copy public URL to products.image_url)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Optional: farm gallery images (used in FarmGallerySection if you switch to DB later)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = excluded.public;

-- Public read for product & gallery images
drop policy if exists "products_storage_public_read" on storage.objects;
create policy "products_storage_public_read" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "gallery_storage_public_read" on storage.objects;
create policy "gallery_storage_public_read" on storage.objects
  for select using (bucket_id = 'gallery');

-- Admins can upload/update/delete in products bucket
drop policy if exists "products_storage_admin_insert" on storage.objects;
create policy "products_storage_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "products_storage_admin_update" on storage.objects;
create policy "products_storage_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "products_storage_admin_delete" on storage.objects;
create policy "products_storage_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "gallery_storage_admin_insert" on storage.objects;
create policy "gallery_storage_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery_storage_admin_update" on storage.objects;
create policy "gallery_storage_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery_storage_admin_delete" on storage.objects;
create policy "gallery_storage_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

-- -----------------------------------------------------------------------------
-- SEED: categories (required for app tabs)
-- -----------------------------------------------------------------------------

insert into public.categories (name, slug, icon, sort_order)
values
  ('Fresh Vegetables', 'fresh-vegetables', 'Leaf', 1),
  ('Meat & Poultry', 'meat-poultry', 'Beef', 2)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- EXAMPLE: add a product after uploading image to Storage
-- -----------------------------------------------------------------------------
-- 1. Upload file to bucket "products" (e.g. tomatoes.jpg)
-- 2. Copy public URL from Storage UI
-- 3. Run:
--
-- insert into public.products (
--   name, category_id, price, unit, image_url,
--   stock_quantity, is_market_price, sort_order
-- ) values (
--   'Tomatoes',
--   (select id from public.categories where slug = 'fresh-vegetables'),
--   25.00,
--   'kg',
--   'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/products/tomatoes.jpg',
--   100,
--   false,
--   1
-- );

-- -----------------------------------------------------------------------------
-- FIRST ADMIN (after you register on the website)
-- -----------------------------------------------------------------------------
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
