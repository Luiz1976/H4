-- Verificar status dos posts prontos para publicação
SELECT 
  id,
  account_id,
  title,
  status,
  created_at,
  published_at
FROM linkedin_posts
WHERE status = 'ready'
ORDER BY created_at ASC;

-- Verificar configurações de auto-posting
SELECT 
  account_id,
  auto_post_enabled,
  post_start_hour,
  post_end_hour,
  post_interval_minutes,
  last_post_at,
  min_posts_ready
FROM linkedin_settings;

-- Verificar contas LinkedIn conectadas
SELECT 
  id,
  name,
  linkedin_user_id,
  access_token IS NOT NULL as has_token,
  created_at
FROM linkedin_accounts;

-- Verificar últimos logs de atividade
SELECT 
  created_at,
  log_type,
  action,
  message,
  details
FROM linkedin_activity_logs
ORDER BY created_at DESC
LIMIT 20;

-- Verificar se o cron job existe
SELECT * FROM cron.job WHERE jobname = 'linkedin-hourly-automation';
