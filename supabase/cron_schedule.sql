-- Enable the pg_cron extension
create extension if not exists pg_cron;

-- Schedule the 'linkedin-scheduler' function to run every hour
-- logic: call the edge function via pg_net (if available) or select a postgres function that calls it
-- For Supabase Edge Functions, the standard way is usually via HTTP call from pg_net or cron triggering an internal webhook.
-- Simpler approach: Supabase Dashboard UI > Database > Cron. But here is the SQL for it.

select cron.schedule(
  'linkedin-hourly-automation', -- job name
  '0 * * * *',                  -- cron schedule (every hour at minute 0)
  $$
    select
      net.http_post(
          url:='https://gdpyuutcmgxtqshxjguz.supabase.co/functions/v1/linkedin-scheduler',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY_HERE"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- Note: You must replace SERVICE_ROLE_KEY_HERE with your actuall Service Role Key.
-- This can be found in Supabase Dashboard > Settings > API.
