-- Enable the pg_cron extension if not enabled
create extension if not exists pg_cron;

-- Schedule the instagram-publisher function to run every 3 hours
-- REPLACE 'YOUR_SERVICE_ROLE_KEY' with your actual Supabase Service Role Key (found in Project Settings > API)
-- REPLACE 'YOUR_PROJECT_REF' if different from 'wdjggjsxsvexqrhyizrn'

select cron.schedule(
  'instagram-publisher-job', -- Job Name
  '0 */3 * * *',             -- Schedule (Every 3 hours at minute 0)
  $$
  select
    net.http_post(
      url:='https://wdjggjsxsvexqrhyizrn.supabase.co/functions/v1/instagram-publisher',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- To check scheduled jobs:
-- select * from cron.job;

-- To un-schedule:
-- select cron.unschedule('instagram-publisher-job');
