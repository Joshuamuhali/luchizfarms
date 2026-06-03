# Supabase setup

## One file to run everything

**Supabase Dashboard → SQL → New query** → paste and run:

### [`schema.sql`](./schema.sql)

This creates:

- Tables: `categories`, `products`, `profiles`, `orders`, `order_items`
- Indexes, triggers, RLS, admin helper
- Auth trigger (profile on signup)
- RPC `customer_submit_for_packaging`
- Storage buckets `products` + `gallery` with policies
- Seed categories (`fresh-vegetables`, `meat-poultry`)

Older split migrations (`000_*`, `001_*`, `002_*`) are optional if you already ran `schema.sql`.

## Environment

Copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYMENT_PHONE=260979654602
VITE_WHATSAPP_NUMBER=260979654602
```

## Auth

**Authentication → Providers → Email** — enable.

For quick local testing, disable **Confirm email**.

## First admin

Register on the site, then:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

Sign out and in → open `/admin`.

## Images

See **[STORAGE.md](./STORAGE.md)** — upload to `products` bucket, copy public URL, set `products.image_url`.

## Order workflow

| Status | Who sets it |
|--------|-------------|
| `placed` | Customer places order |
| `packaging` | Customer → Send for packaging |
| `ready_for_payment` | Admin |
| `paid` | Admin (Mark paid) |
| `delivered` | Admin |

Full product doc: [`docs/USER_JOURNEY.md`](../docs/USER_JOURNEY.md)
