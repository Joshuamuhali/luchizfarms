# Product images (Supabase Storage)

## Buckets (created by `schema.sql`)

| Bucket     | Public | Use |
|------------|--------|-----|
| `products` | Yes    | Product photos → paste URL into `products.image_url` |
| `gallery`  | Yes    | Optional farm gallery photos |

## Upload workflow

1. Open **Supabase Dashboard → Storage → `products`**
2. **Upload** your image (e.g. `tomatoes.jpg`)
3. Click the file → **Copy URL** (public URL)
4. Paste into the database:

```sql
update public.products
set image_url = 'https://xxxx.supabase.co/storage/v1/object/public/products/tomatoes.jpg'
where name = 'Tomatoes';
```

Or when inserting a new product:

```sql
insert into public.products (name, category_id, price, unit, image_url, stock_quantity, sort_order)
values (
  'Tomatoes',
  (select id from public.categories where slug = 'fresh-vegetables'),
  25,
  'kg',
  'https://xxxx.supabase.co/storage/v1/object/public/products/tomatoes.jpg',
  50,
  1
);
```

## URL format

```
https://<PROJECT_REF>.supabase.co/storage/v1/object/public/products/<filename>
```

The app also normalizes signed URLs to public paths in `DataService.getProducts()`.

## Who can upload?

- **Dashboard**: anyone with Supabase project access
- **App**: only users with `profiles.role = 'admin'` (Storage RLS policies)

## Tips

- Use lowercase filenames without spaces (`pork-chops.jpg`)
- Prefer `.jpg` or `.webp` under 5 MB
- Set `is_active = true` on products you want visible in the shop
