-- DIAGNÓSTICO SIMPLIFICADO - Execute cada query separadamente

-- Query 1: Ver estrutura da tabela linkedin_settings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'linkedin_settings';

-- Query 2: Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'linkedin%';

-- Query 3: Posts prontos (se a tabela existir)
SELECT COUNT(*) as posts_prontos
FROM linkedin_posts
WHERE status = 'ready';

-- Query 4: Contas LinkedIn (se a tabela existir)
SELECT id, name, linkedin_user_id
FROM linkedin_accounts
LIMIT 5;

-- Query 5: Verificar cron job
SELECT * FROM cron.job WHERE jobname = 'linkedin-hourly-automation';
