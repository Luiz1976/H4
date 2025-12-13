-- Verificar configurações de auto-post
SELECT 
  la.id,
  la.name,
  ls.auto_post_enabled,
  ls.post_start_hour,
  ls.post_end_hour,
  ls.post_interval_minutes,
  ls.last_post_at
FROM linkedin_accounts la
LEFT JOIN linkedin_settings ls ON ls.account_id = la.id;

-- Se auto_post_enabled for FALSE, execute este comando para ativar:
-- UPDATE linkedin_settings 
-- SET auto_post_enabled = true 
-- WHERE account_id = (SELECT id FROM linkedin_accounts LIMIT 1);
