-- Secure customer actions + timestamps

alter table public.orders
  add column if not exists updated_at timestamptz not null default now();

-- Customer may only move placed → packaging via RPC
create or replace function public.customer_submit_for_packaging(p_order_id uuid)
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
  set status = 'packaging', updated_at = now()
  where id = p_order_id
  returning * into result;

  return result;
end;
$$;

grant execute on function public.customer_submit_for_packaging (uuid) to authenticated;

-- Remove broad customer UPDATE on orders (admin policy remains)
drop policy if exists "Orders: customer update own (limited)" on public.orders;

-- Auto-update updated_at
create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
