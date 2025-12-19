-- Script para corrigir a tabela linkedin_settings e habilitar auto-posting
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar colunas faltantes
ALTER TABLE linkedin_settings 
ADD COLUMN IF NOT EXISTS auto_post_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS post_start_hour INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS post_end_hour INTEGER DEFAULT 22,
ADD COLUMN IF NOT EXISTS post_interval_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS min_posts_ready INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS auto_comment_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_promote_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_post_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_scheduled_post TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- 2. Criar registro de configurações para a conta Humaniq AI
INSERT INTO linkedin_settings (
  account_id,
  auto_post_enabled,
  post_start_hour,
  post_end_hour,
  post_interval_minutes,
  min_posts_ready,
  auto_comment_enabled,
  auto_promote_enabled
) VALUES (
  '8c01733e-c90e-4561-974d-2f35a241029c',
  true,
  6,
  22,
  60,
  10,
  true,
  true
)
ON CONFLICT (account_id) DO UPDATE SET
  auto_post_enabled = true,
  post_start_hour = 6,
  post_end_hour = 22,
  post_interval_minutes = 60,
  min_posts_ready = 10,
  auto_comment_enabled = true,
  auto_promote_enabled = true;

-- 3. Verificar se foi criado corretamente
SELECT 
  account_id,
  auto_post_enabled,
  post_start_hour,
  post_end_hour,
  post_interval_minutes,
  min_posts_ready,
  last_post_at
FROM linkedin_settings;
