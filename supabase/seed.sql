-- =============================================================================
-- Reference data for a fresh database.
--
-- PLACEHOLDERS — confirm before launch:
--   * Delivery fees and timeframes below are estimates, not RBN's real rates.
--   * The pickup location is inactive until a real address is entered.
-- Products are not seeded here; the real catalogue is imported separately.
-- =============================================================================

insert into public.categories (slug, name, sort_order) values
  ('tees', 'T-Shirts', 10),
  ('polos', 'Polos', 20),
  ('hoodies', 'Hoodies & Sweats', 30),
  ('pants', 'Pants', 40),
  ('outerwear', 'Outerwear', 50),
  ('accessories', 'Accessories', 60)
on conflict (slug) do nothing;

with zones (name, fee, min_days, max_days, sort_order, states) as (
  values
    ('Abuja (FCT)', 300000, 1, 2, 10,
      array['FCT']),
    ('North Central', 500000, 2, 4, 20,
      array['Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau']),
    ('South West', 600000, 2, 4, 30,
      array['Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo']),
    ('South South & South East', 650000, 3, 5, 40,
      array['Abia', 'Akwa Ibom', 'Anambra', 'Bayelsa', 'Cross River', 'Delta',
            'Ebonyi', 'Edo', 'Enugu', 'Imo', 'Rivers']),
    ('North West & North East', 700000, 3, 6, 50,
      array['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Jigawa', 'Kaduna', 'Kano',
            'Katsina', 'Kebbi', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'])
),
inserted as (
  insert into public.delivery_zones (name, fee, min_days, max_days, sort_order)
  select name, fee, min_days, max_days, sort_order from zones
  on conflict (name) do nothing
  returning id, name
)
insert into public.delivery_zone_states (state, zone_id)
select unnest(z.states), i.id
from zones z
join inserted i on i.name = z.name
on conflict (state) do nothing;

insert into public.pickup_locations (name, address, city, state, hours, is_active)
select 'RBN Studio', 'Address to be confirmed', 'Abuja', 'FCT', 'Mon–Sat, 10am–6pm', false
where not exists (select 1 from public.pickup_locations);
