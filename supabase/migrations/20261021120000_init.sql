-- =============================================================================
-- Rain by Nurain — core schema
--
-- Conventions
--   * Money is stored as bigint minor units (kobo for NGN). ₦45,000 = 4500000.
--   * Every table has row level security enabled. Anonymous visitors can read
--     the active catalogue; everything else is owner- or admin-only.
--   * Order placement, payment confirmation and stock changes happen only inside
--     the security-definer functions at the bottom of this file, so prices and
--     stock are always computed by the database, never trusted from a client.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public;

-- -----------------------------------------------------------------------------
-- Types
-- -----------------------------------------------------------------------------

create type public.product_status as enum ('draft', 'active', 'archived');

create type public.order_status as enum (
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.fulfillment_method as enum ('delivery', 'pickup');

create type public.user_role as enum ('customer', 'admin');

create domain public.nigerian_state as text check (
  value in (
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
    'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  )
);

-- -----------------------------------------------------------------------------
-- Shared trigger functions
-- -----------------------------------------------------------------------------

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles (one per auth user)
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, lower(new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = lower(new.email) where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.handle_user_email_change();

-- Used by RLS policies, so it must stay executable by anon and authenticated.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Catalogue
-- -----------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function private.set_updated_at();

-- One row per colourway. Colourways of the same garment share a style_code so
-- the product page can link between them; sizes live in product_variants.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  details text[] not null default '{}',
  category_id uuid not null references public.categories (id) on delete restrict,
  style_code text,
  color_name text,
  color_hex text check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  price bigint not null check (price > 0),
  compare_at_price bigint check (compare_at_price > price),
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(color_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_status_sort_idx on public.products (status, sort_order);
create index products_style_code_idx on public.products (style_code) where style_code is not null;
create index products_search_idx on public.products using gin (search);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function private.set_updated_at();

-- Stamps the first time a product goes on sale; "Newest" sorts by it.
create function private.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'active' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger products_set_published_at
  before insert or update of status on public.products
  for each row execute function private.set_published_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Object path inside the public "products" storage bucket.
  path text not null check (length(path) > 0),
  alt text not null default '',
  width integer check (width > 0),
  height integer check (height > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null check (length(trim(size)) > 0),
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Delivery & pickup
-- -----------------------------------------------------------------------------

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  fee bigint not null check (fee >= 0),
  -- Orders whose subtotal reaches this amount ship free. Null = never free.
  free_over bigint check (free_over > 0),
  min_days integer not null check (min_days >= 0),
  max_days integer not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (max_days >= min_days)
);

create trigger delivery_zones_set_updated_at
  before update on public.delivery_zones
  for each row execute function private.set_updated_at();

-- Primary key on state guarantees every state belongs to at most one zone.
create table public.delivery_zone_states (
  state public.nigerian_state primary key,
  zone_id uuid not null references public.delivery_zones (id) on delete cascade
);

create index delivery_zone_states_zone_idx on public.delivery_zone_states (zone_id);

create table public.pickup_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  address text not null,
  city text not null,
  state public.nigerian_state not null,
  hours text,
  instructions text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pickup_locations_set_updated_at
  before update on public.pickup_locations
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Orders
-- -----------------------------------------------------------------------------

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('RBN-' || nextval('public.order_number_seq')),
  user_id uuid references auth.users (id) on delete set null,
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (length(trim(phone)) > 0),
  full_name text not null check (length(trim(full_name)) > 0),
  fulfillment public.fulfillment_method not null,
  address_line1 text,
  address_line2 text,
  city text,
  state public.nigerian_state,
  -- Zones and pickup locations are deactivated, never deleted, once used.
  delivery_zone_id uuid references public.delivery_zones (id) on delete restrict,
  pickup_location_id uuid references public.pickup_locations (id) on delete restrict,
  delivery_note text,
  subtotal bigint not null check (subtotal >= 0),
  delivery_fee bigint not null check (delivery_fee >= 0),
  discount_total bigint not null default 0 check (discount_total >= 0),
  total bigint not null check (total >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status public.order_status not null default 'pending_payment',
  payment_reference text not null unique,
  paid_at timestamptz,
  -- Stock is held for unpaid orders until this time, then released.
  reserved_until timestamptz,
  needs_review boolean not null default false,
  review_reason text,
  tracking_number text,
  carrier text,
  -- Lets a guest open their order page from the confirmation link or email.
  access_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_matches check (total = subtotal + delivery_fee - discount_total),
  constraint orders_fulfillment_details check (
    (fulfillment = 'delivery'
      and address_line1 is not null and city is not null and state is not null
      and delivery_zone_id is not null and pickup_location_id is null)
    or
    (fulfillment = 'pickup'
      and pickup_location_id is not null and delivery_zone_id is null)
  )
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_email_idx on public.orders (lower(email));
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_reserved_until_idx on public.orders (reserved_until)
  where status = 'pending_payment';
create index orders_delivery_zone_idx on public.orders (delivery_zone_id);
create index orders_pickup_location_idx on public.orders (pickup_location_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function private.set_updated_at();

-- Line items are snapshots: they keep the name, size and price the customer
-- paid even if the product changes later. Products that have been ordered can
-- be archived but not deleted.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  product_name text not null,
  product_slug text not null,
  color_name text,
  size text not null,
  image_path text,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 10),
  line_total bigint generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now(),
  unique (order_id, variant_id)
);

create index order_items_product_idx on public.order_items (product_id);
create index order_items_variant_idx on public.order_items (variant_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  -- Set when the event moved the order to a new status.
  status public.order_status,
  message text not null,
  -- Internal notes are visible to admins only.
  is_internal boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at);
create index order_events_created_by_idx on public.order_events (created_by);

-- Raw payment provider notifications, kept for audit and debugging.
create table public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null default 'paystack',
  event text not null,
  reference text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index payment_events_reference_idx on public.payment_events (reference);

-- -----------------------------------------------------------------------------
-- Row level security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.delivery_zone_states enable row level security;
alter table public.pickup_locations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.payment_events enable row level security;

-- Profiles: users read their own; only name and phone are self-editable.
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Catalogue: public reads of active products, admin writes.
create policy "Anyone reads categories" on public.categories
  for select to anon, authenticated
  using (true);

create policy "Admins manage categories" on public.categories
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone reads active products" on public.products
  for select to anon, authenticated
  using (status = 'active' or (select public.is_admin()));

create policy "Admins manage products" on public.products
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone reads images of active products" on public.product_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.status = 'active' or (select public.is_admin()))
    )
  );

create policy "Admins manage product images" on public.product_images
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone reads variants of active products" on public.product_variants
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.status = 'active' or (select public.is_admin()))
    )
  );

create policy "Admins manage product variants" on public.product_variants
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Delivery & pickup options: public reads of active ones, admin writes.
create policy "Anyone reads active delivery zones" on public.delivery_zones
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy "Admins manage delivery zones" on public.delivery_zones
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone reads delivery zone states" on public.delivery_zone_states
  for select to anon, authenticated
  using (true);

create policy "Admins manage delivery zone states" on public.delivery_zone_states
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Anyone reads active pickup locations" on public.pickup_locations
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));

create policy "Admins manage pickup locations" on public.pickup_locations
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Orders: customers read their own; all writes go through functions below.
create policy "Customers read own orders" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Customers read own order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = (select auth.uid()) or (select public.is_admin()))
    )
  );

create policy "Customers read own order timeline" on public.order_events
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      not is_internal
      and exists (
        select 1 from public.orders o
        where o.id = order_id and o.user_id = (select auth.uid())
      )
    )
  );

create policy "Admins read payment events" on public.payment_events
  for select to authenticated
  using ((select public.is_admin()));

revoke insert, update, delete on public.orders, public.order_items,
  public.order_events, public.payment_events from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Stock helpers (private: not exposed through the API)
-- -----------------------------------------------------------------------------

create function private.restock_order_items(p_order_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.product_variants v
  set stock = v.stock + i.quantity
  from public.order_items i
  where i.order_id = p_order_id and v.id = i.variant_id;
$$;

-- Takes the stock for an order's items again. Returns false, changing nothing,
-- if any item no longer has enough stock.
create function private.reserve_order_items(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Lock in a consistent order so concurrent checkouts cannot deadlock.
  perform 1
  from public.product_variants v
  where v.id in (select i.variant_id from public.order_items i where i.order_id = p_order_id)
  order by v.id
  for update;

  if exists (
    select 1
    from public.order_items i
    join public.product_variants v on v.id = i.variant_id
    where i.order_id = p_order_id and v.stock < i.quantity
  ) then
    return false;
  end if;

  update public.product_variants v
  set stock = v.stock - i.quantity
  from public.order_items i
  where i.order_id = p_order_id and v.id = i.variant_id;

  return true;
end;
$$;

-- Cancels an unpaid order and puts its stock back. Caller must hold the row lock.
create function private.cancel_unpaid_order(p_order_id uuid, p_message text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.restock_order_items(p_order_id);

  update public.orders
  set status = 'cancelled', reserved_until = null
  where id = p_order_id;

  insert into public.order_events (order_id, status, message)
  values (p_order_id, 'cancelled', p_message);
end;
$$;

-- -----------------------------------------------------------------------------
-- Checkout: create_order
--
-- Called by the server (service role) when a customer starts payment. Prices,
-- delivery fee and totals come from the database; the caller only supplies
-- which variants and how many. Stock is reserved immediately so two people can
-- never pay for the last item.
--
-- Raises (message / detail):
--   empty_cart, too_many_items, invalid_quantity / variant_id,
--   product_unavailable / variant_id, insufficient_stock / variant_id (hint: stock),
--   address_required, delivery_unavailable / state, pickup_unavailable
-- -----------------------------------------------------------------------------

create function public.create_order(
  p_email text,
  p_phone text,
  p_full_name text,
  p_fulfillment public.fulfillment_method,
  p_items jsonb,
  p_address_line1 text default null,
  p_address_line2 text default null,
  p_city text default null,
  p_state text default null,
  p_delivery_note text default null,
  p_pickup_location_id uuid default null,
  p_user_id uuid default null,
  p_reservation_minutes integer default 30
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_line record;
  v_variant record;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal bigint := 0;
  v_fee bigint := 0;
  v_zone public.delivery_zones;
  v_order public.orders;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;

  if jsonb_array_length(p_items) > 20 then
    raise exception 'too_many_items';
  end if;

  -- One line per variant (quantities summed), locked in id order.
  for v_line in
    select (item ->> 'variant_id')::uuid as variant_id,
           sum((item ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as item
    group by 1
    order by 1
  loop
    if v_line.quantity is null or v_line.quantity < 1 or v_line.quantity > 10 then
      raise exception 'invalid_quantity' using detail = v_line.variant_id::text;
    end if;

    select v.id, v.size, v.stock, p.id as product_id, p.name, p.slug, p.color_name,
           p.price, p.status,
           (select i.path from public.product_images i
            where i.product_id = p.id
            order by i.sort_order, i.created_at
            limit 1) as image_path
    into v_variant
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.id = v_line.variant_id
    for update of v;

    if not found or v_variant.status <> 'active' then
      raise exception 'product_unavailable' using detail = v_line.variant_id::text;
    end if;

    if v_variant.stock < v_line.quantity then
      raise exception 'insufficient_stock'
        using detail = v_line.variant_id::text, hint = v_variant.stock::text;
    end if;

    update public.product_variants
    set stock = stock - v_line.quantity
    where id = v_variant.id;

    v_subtotal := v_subtotal + v_variant.price * v_line.quantity;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_variant.product_id,
      'variant_id', v_variant.id,
      'product_name', v_variant.name,
      'product_slug', v_variant.slug,
      'color_name', v_variant.color_name,
      'size', v_variant.size,
      'image_path', v_variant.image_path,
      'unit_price', v_variant.price,
      'quantity', v_line.quantity
    );
  end loop;

  if p_fulfillment = 'delivery' then
    if coalesce(trim(p_address_line1), '') = ''
      or coalesce(trim(p_city), '') = ''
      or coalesce(trim(p_state), '') = '' then
      raise exception 'address_required';
    end if;

    select z.* into v_zone
    from public.delivery_zone_states s
    join public.delivery_zones z on z.id = s.zone_id
    where s.state = p_state and z.is_active;

    if not found then
      raise exception 'delivery_unavailable' using detail = p_state;
    end if;

    v_fee := case
      when v_zone.free_over is not null and v_subtotal >= v_zone.free_over then 0
      else v_zone.fee
    end;
  else
    perform 1 from public.pickup_locations
    where id = p_pickup_location_id and is_active;

    if not found then
      raise exception 'pickup_unavailable';
    end if;
  end if;

  insert into public.orders (
    user_id, email, phone, full_name, fulfillment,
    address_line1, address_line2, city, state, delivery_zone_id,
    pickup_location_id, delivery_note,
    subtotal, delivery_fee, total,
    payment_reference, reserved_until
  )
  values (
    p_user_id,
    lower(trim(p_email)),
    trim(p_phone),
    trim(p_full_name),
    p_fulfillment,
    case when p_fulfillment = 'delivery' then trim(p_address_line1) end,
    case when p_fulfillment = 'delivery' then nullif(trim(p_address_line2), '') end,
    case when p_fulfillment = 'delivery' then trim(p_city) end,
    case when p_fulfillment = 'delivery' then p_state end,
    case when p_fulfillment = 'delivery' then v_zone.id end,
    case when p_fulfillment = 'pickup' then p_pickup_location_id end,
    nullif(trim(p_delivery_note), ''),
    v_subtotal,
    v_fee,
    v_subtotal + v_fee,
    'rbn_' || replace(gen_random_uuid()::text, '-', ''),
    now() + make_interval(mins => p_reservation_minutes)
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, product_id, variant_id, product_name, product_slug,
    color_name, size, image_path, unit_price, quantity
  )
  select v_order.id, l.product_id, l.variant_id, l.product_name, l.product_slug,
         l.color_name, l.size, l.image_path, l.unit_price, l.quantity
  from jsonb_to_recordset(v_lines) as l (
    product_id uuid, variant_id uuid, product_name text, product_slug text,
    color_name text, size text, image_path text, unit_price bigint, quantity integer
  );

  insert into public.order_events (order_id, status, message)
  values (v_order.id, 'pending_payment', 'Order placed. Waiting for payment.');

  return v_order;
end;
$$;

-- -----------------------------------------------------------------------------
-- Payments: confirm_payment
--
-- Called by the server after Paystack reports a successful charge (from the
-- webhook or the post-checkout redirect, whichever arrives first). Safe to call
-- repeatedly. Only marks the order paid when the amount and currency match the
-- order total exactly.
-- -----------------------------------------------------------------------------

create function public.confirm_payment(
  p_reference text,
  p_amount bigint,
  p_currency text,
  p_paid_at timestamptz default null
)
returns table (
  order_id uuid,
  order_number text,
  order_status public.order_status,
  newly_paid boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_reason text;
begin
  select * into v_order
  from public.orders
  where payment_reference = p_reference
  for update;

  if not found then
    raise exception 'order_not_found' using detail = p_reference;
  end if;

  -- Already handled (paid, fulfilled, refunded): nothing to do.
  if v_order.status not in ('pending_payment', 'cancelled') then
    return query select v_order.id, v_order.number, v_order.status, false;
    return;
  end if;

  if p_amount is distinct from v_order.total or upper(p_currency) is distinct from v_order.currency then
    v_reason := format(
      'Payment amount mismatch: received %s %s, expected %s %s. Do not fulfil until resolved.',
      p_amount, upper(p_currency), v_order.total, v_order.currency
    );
    if v_order.review_reason is distinct from v_reason then
      update public.orders
      set needs_review = true, review_reason = v_reason
      where id = v_order.id;

      insert into public.order_events (order_id, message, is_internal)
      values (v_order.id, v_reason, true);
    end if;

    return query select v_order.id, v_order.number, v_order.status, false;
    return;
  end if;

  -- The reservation expired (and stock was released) before payment landed.
  if v_order.status = 'cancelled' then
    if private.reserve_order_items(v_order.id) then
      insert into public.order_events (order_id, message, is_internal)
      values (v_order.id, 'Payment arrived after the reservation expired. Stock was reserved again.', true);
    else
      v_reason := 'Payment arrived after the reservation expired and some items are no longer in stock. Refund or restock before fulfilling.';
      update public.orders
      set needs_review = true, review_reason = v_reason
      where id = v_order.id;

      insert into public.order_events (order_id, message, is_internal)
      values (v_order.id, v_reason, true);
    end if;
  end if;

  update public.orders
  set status = 'paid', paid_at = coalesce(p_paid_at, now()), reserved_until = null
  where id = v_order.id
  returning * into v_order;

  insert into public.order_events (order_id, status, message)
  values (v_order.id, 'paid', 'Payment confirmed.');

  return query select v_order.id, v_order.number, v_order.status, true;
end;
$$;

-- -----------------------------------------------------------------------------
-- Reservations: release_expired_orders (run every few minutes by pg_cron)
-- -----------------------------------------------------------------------------

create function public.release_expired_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_count integer := 0;
begin
  for v_order_id in
    select id from public.orders
    where status = 'pending_payment' and reserved_until < now()
    order by created_at
    for update skip locked
  loop
    perform private.cancel_unpaid_order(
      v_order_id,
      'Payment was not completed in time, so the order was cancelled.'
    );
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Checkout: cancel_pending_order
--
-- Releases an unpaid order's stock straight away, e.g. when payment could not
-- be started or the customer cancelled on the Paystack page. Returns false and
-- does nothing if the order is no longer waiting for payment.
-- -----------------------------------------------------------------------------

create function public.cancel_pending_order(p_reference text, p_message text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
begin
  select id into v_order_id
  from public.orders
  where payment_reference = p_reference and status = 'pending_payment'
  for update;

  if not found then
    return false;
  end if;

  perform private.cancel_unpaid_order(v_order_id, p_message);
  return true;
end;
$$;

-- -----------------------------------------------------------------------------
-- Accounts: claim_guest_orders
--
-- Links guest orders to the signed-in customer, matching on their verified
-- email address. Called after sign-in.
-- -----------------------------------------------------------------------------

create function public.claim_guest_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.orders o
  set user_id = u.id
  from auth.users u
  where u.id = (select auth.uid())
    and u.email_confirmed_at is not null
    and o.user_id is null
    and lower(o.email) = lower(u.email);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin: update_order_status
--
-- Moves an order through fulfilment. Cancelling or refunding before dispatch
-- puts the stock back.
-- -----------------------------------------------------------------------------

create function public.update_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_message text default null,
  p_tracking_number text default null,
  p_carrier text default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_allowed public.order_status[];
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;

  v_allowed := case v_order.status
    when 'pending_payment' then array['cancelled']::public.order_status[]
    when 'paid' then array['processing', 'shipped', 'cancelled', 'refunded']::public.order_status[]
    when 'processing' then array['shipped', 'cancelled', 'refunded']::public.order_status[]
    when 'shipped' then array['delivered', 'refunded']::public.order_status[]
    when 'delivered' then array['refunded']::public.order_status[]
    else array[]::public.order_status[]
  end;

  if not p_status = any (v_allowed) then
    raise exception 'invalid_transition'
      using detail = format('%s -> %s', v_order.status, p_status);
  end if;

  -- Stock goes back on the shelf only if it never left the building.
  if p_status in ('cancelled', 'refunded')
    and v_order.status in ('pending_payment', 'paid', 'processing') then
    perform private.restock_order_items(v_order.id);
  end if;

  update public.orders
  set status = p_status,
      reserved_until = null,
      tracking_number = coalesce(nullif(trim(p_tracking_number), ''), tracking_number),
      carrier = coalesce(nullif(trim(p_carrier), ''), carrier)
  where id = v_order.id
  returning * into v_order;

  insert into public.order_events (order_id, status, message, created_by)
  values (
    v_order.id,
    p_status,
    coalesce(nullif(trim(p_message), ''), case p_status
      when 'processing' then 'We are preparing your order.'
      when 'shipped' then case v_order.fulfillment
        when 'pickup' then 'Your order is ready for pickup.'
        else 'Your order is on its way.'
      end
      when 'delivered' then case v_order.fulfillment
        when 'pickup' then 'Your order was collected.'
        else 'Your order was delivered.'
      end
      when 'cancelled' then 'Your order was cancelled.'
      when 'refunded' then 'Your payment was refunded.'
    end),
    (select auth.uid())
  );

  return v_order;
end;
$$;

create function public.resolve_order_review(p_order_id uuid, p_note text)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.orders
  set needs_review = false, review_reason = null
  where id = p_order_id
  returning * into v_order;

  if not found then
    raise exception 'order_not_found';
  end if;

  insert into public.order_events (order_id, message, is_internal, created_by)
  values (p_order_id, 'Review resolved: ' || coalesce(nullif(trim(p_note), ''), 'no note'), true, (select auth.uid()));

  return v_order;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin: save_product
--
-- Creates (p_id null) or updates a product and replaces its sizes in one transaction.
-- Runs as the caller, so row level security limits it to admins.
-- p_variants: [{ "id"?: uuid, "size": text, "stock": int, "sku"?: text }]
-- Sizes left out are deleted; a size that has been ordered can't be deleted
-- (restrict_violation 23001), so set its stock to 0 instead.
-- -----------------------------------------------------------------------------

create function public.save_product(p_product jsonb, p_variants jsonb, p_id uuid default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := p_id;
  v_row public.products;
  v_kept uuid[];
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_row := jsonb_populate_record(null::public.products, p_product);

  if v_id is null then
    insert into public.products (
      slug, name, description, details, category_id, style_code, color_name, color_hex,
      price, compare_at_price, status, is_featured, sort_order
    )
    values (
      v_row.slug, v_row.name, coalesce(v_row.description, ''), coalesce(v_row.details, '{}'),
      v_row.category_id, v_row.style_code, v_row.color_name, v_row.color_hex,
      v_row.price, v_row.compare_at_price, coalesce(v_row.status, 'draft'),
      coalesce(v_row.is_featured, false), coalesce(v_row.sort_order, 0)
    )
    returning id into v_id;
  else
    update public.products
    set slug = v_row.slug,
        name = v_row.name,
        description = coalesce(v_row.description, ''),
        details = coalesce(v_row.details, '{}'),
        category_id = v_row.category_id,
        style_code = v_row.style_code,
        color_name = v_row.color_name,
        color_hex = v_row.color_hex,
        price = v_row.price,
        compare_at_price = v_row.compare_at_price,
        status = coalesce(v_row.status, 'draft'),
        is_featured = coalesce(v_row.is_featured, false),
        sort_order = coalesce(v_row.sort_order, 0)
    where id = v_id;

    if not found then
      raise exception 'product_not_found';
    end if;
  end if;

  select coalesce(array_agg((v ->> 'id')::uuid), '{}')
  into v_kept
  from jsonb_array_elements(p_variants) as v
  where v ? 'id';

  delete from public.product_variants
  where product_id = v_id and not (id = any (v_kept));

  update public.product_variants pv
  set size = trim(e.v ->> 'size'),
      stock = (e.v ->> 'stock')::integer,
      sku = nullif(trim(e.v ->> 'sku'), ''),
      sort_order = e.position
  from jsonb_array_elements(p_variants) with ordinality as e (v, position)
  where e.v ? 'id' and pv.id = (e.v ->> 'id')::uuid and pv.product_id = v_id;

  insert into public.product_variants (product_id, size, stock, sku, sort_order)
  select v_id, trim(e.v ->> 'size'), (e.v ->> 'stock')::integer, nullif(trim(e.v ->> 'sku'), ''), e.position
  from jsonb_array_elements(p_variants) with ordinality as e (v, position)
  where not (e.v ? 'id');

  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Function permissions
--
-- Postgres grants EXECUTE to PUBLIC by default and Supabase also grants it to
-- anon/authenticated, so lock each function down explicitly.
-- -----------------------------------------------------------------------------

revoke execute on all functions in schema private from public, anon, authenticated;

revoke execute on function public.create_order(
  text, text, text, public.fulfillment_method, jsonb, text, text, text, text, text, uuid, uuid, integer
) from public, anon, authenticated;
revoke execute on function public.confirm_payment(text, bigint, text, timestamptz)
  from public, anon, authenticated;
revoke execute on function public.release_expired_orders() from public, anon, authenticated;
revoke execute on function public.cancel_pending_order(text, text) from public, anon, authenticated;

grant execute on function public.create_order(
  text, text, text, public.fulfillment_method, jsonb, text, text, text, text, text, uuid, uuid, integer
) to service_role;
grant execute on function public.confirm_payment(text, bigint, text, timestamptz) to service_role;
grant execute on function public.release_expired_orders() to service_role;
grant execute on function public.cancel_pending_order(text, text) to service_role;

revoke execute on function public.claim_guest_orders() from public, anon;
grant execute on function public.claim_guest_orders() to authenticated;

revoke execute on function public.update_order_status(uuid, public.order_status, text, text, text)
  from public, anon;
grant execute on function public.update_order_status(uuid, public.order_status, text, text, text)
  to authenticated;

revoke execute on function public.resolve_order_review(uuid, text) from public, anon;
grant execute on function public.resolve_order_review(uuid, text) to authenticated;

revoke execute on function public.save_product(jsonb, jsonb, uuid) from public, anon;
grant execute on function public.save_product(jsonb, jsonb, uuid) to authenticated;
