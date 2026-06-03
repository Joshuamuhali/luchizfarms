-- =============================================================================
-- Luchiz Farm — Full Product Seed
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Images: set image_url per product when you have URLs ready
-- =============================================================================

-- Clear existing products (safe — re-runnable)
delete from public.products;

-- ─────────────────────────────────────────────────────────────────────────────
-- FRESH VEGETABLES
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.products (
  name, category_id, price, unit,
  is_market_price, market_note,
  stock_quantity, low_stock_threshold,
  is_active, sort_order, image_url
)
select
  v.name,
  (select id from public.categories where slug = 'fresh-vegetables'),
  v.price,
  v.unit,
  v.is_market_price,
  v.market_note,
  50,   -- default stock
  5,    -- low stock threshold
  true,
  v.sort_order,
  null  -- image_url: fill in later
from (values
  ('Rape',           50.00,  'bundle', false, null,          1),
  ('Chibwabwa',      50.00,  'bundle', false, null,          2),
  ('Chinese Cabbage',50.00,  'head',   false, null,          3),
  ('Lumanda',        50.00,  'bundle', false, null,          4),
  ('Impwa',          50.00,  'bundle', false, null,          5),
  ('Okra',           50.00,  'bundle', false, null,          6),
  ('Onions',         null,   'kg',     true,  'Market Price', 7),
  ('Tomatoes',       null,   'kg',     true,  'Market Price', 8),
  ('Carrots',        100.00, 'bundle', false, null,          9),
  ('Green Pepper',   50.00,  'piece',  false, null,          10),
  ('Red & Yellow Pepper', 200.00, 'piece', false, null,      11)
) as v(name, price, unit, is_market_price, market_note, sort_order);


-- ─────────────────────────────────────────────────────────────────────────────
-- MEAT & POULTRY
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.products (
  name, category_id, price, unit,
  is_market_price, market_note,
  stock_quantity, low_stock_threshold,
  is_active, sort_order, image_url
)
select
  m.name,
  (select id from public.categories where slug = 'meat-poultry'),
  m.price,
  m.unit,
  m.is_market_price,
  m.market_note,
  20,   -- default stock
  3,    -- low stock threshold
  true,
  m.sort_order,
  null  -- image_url: fill in later
from (values
  ('Pork Chops',                 1100.00, 'kg',    false, null,                   1),
  ('Mixed Cut Beef (Stew Cuts)', 1200.00, 'kg',    false, null,                   2),
  ('Steak & Steak on Bone',      1300.00, 'kg',    false, null,                   3),
  ('Lamb',                       1000.00, 'kg',    false, null,                   4),
  ('Goat Meat',                  1000.00, 'kg',    false, null,                   5),
  ('Beef Offals',                 800.00, 'kg',    false, null,                   6),
  ('Goat Offals',                 700.00, 'kg',    false, null,                   7),
  ('Pork Trotters',               700.00, 'kg',    false, null,                   8),
  ('Cow Trotters',               null,    'piece', true,  'Contact for pricing',  9),
  ('Broiler Chicken (Dressed)',  1500.00, 'whole', false, null,                   10),
  ('Village Chicken (Dressed)',  1500.00, 'whole', false, null,                   11)
) as m(name, price, unit, is_market_price, market_note, sort_order);


-- ─────────────────────────────────────────────────────────────────────────────
-- Verify
-- ─────────────────────────────────────────────────────────────────────────────
select
  c.name as category,
  p.sort_order,
  p.name,
  p.unit,
  case when p.is_market_price then p.market_note else 'K' || p.price::text end as price_display,
  p.image_url
from public.products p
join public.categories c on c.id = p.category_id
order by c.sort_order, p.sort_order;
