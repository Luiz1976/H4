-- Script para configurar publicação automática hora a hora
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover cron antigo se existir
SELECT cron.unschedule('linkedin-hourly-automation');

-- 2. Criar novo cron com URLs corretas
SELECT cron.schedule(
  'linkedin-hourly-automation',
  '0 * * * *', -- Roda a cada hora no minuto 0
  $$
    SELECT
      net.http_post(
          url:='https://wdjggjsxsvexqrhyizrn.supabase.co/functions/v1/linkedin-scheduler',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkamdnanN4c3ZleHFyaHlpenJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDAzMDY0MywiZXhwIjoyMDQ5NjA2NjQzfQ.VN8tF_uf-XlkKOEJ1jDBUkjcEq7jOPpvH4VoGtKHvjE"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
  $$
);

-- 3. Verificar se o cron foi criado
SELECT * FROM cron.job WHERE jobname = 'linkedin-hourly-automation';
