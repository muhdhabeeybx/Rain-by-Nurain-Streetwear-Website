-- Release stock held by unpaid orders every five minutes.
create extension if not exists pg_cron;

select cron.schedule(
  'release-expired-orders',
  '*/5 * * * *',
  $$ select public.release_expired_orders(); $$
);
