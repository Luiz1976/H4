-- Migration: Corrigir RLS para permitir criação de convites por usuários anônimos
-- Data: 2025-01-08
-- Descrição: Permite inserção de convites por usuários anônimos com validações rigorosas

-- 1. Remover política restritiva atual
DROP POLICY IF EXISTS "Admins podem inserir convites empresa" ON convites_empresa;

-- 2. Criar nova política que permite inserção por anônimos com validações
CREATE POLICY "Permitir criação de convites com validações" ON convites_empresa
    FOR INSERT 
    WITH CHECK (
        -- Permitir se for admin autenticado
        (
            auth.role() = 'authenticated' AND 
            (
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
                OR
                EXISTS (
                    SELECT 1 FROM admins 
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
        )
        OR
        -- OU permitir para anônimos com validações específicas
        (
            auth.role() = 'anon' AND
            -- Validar que o admin_id existe na tabela admins
            EXISTS (
                SELECT 1 FROM admins 
                WHERE id = admin_id
            ) AND
            -- Validar que não existe convite ativo para o mesmo email
            NOT EXISTS (
                SELECT 1 FROM convites_empresa 
                WHERE email_contato = NEW.email_contato 
                AND status = 'pendente' 
                AND validade > NOW()
            ) AND
            -- Validar formato do email
            email_contato ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
            -- Validar que o nome da empresa não está vazio
            LENGTH(TRIM(nome_empresa)) > 0 AND
            -- Validar que a validade é futura (máximo 30 dias)
            validade > NOW() AND
            validade <= NOW() + INTERVAL '30 days' AND
            -- Validar status inicial
            status = 'pendente'
        )
    );

-- 3. Comentário explicativo
COMMENT ON POLICY "Permitir criação de convites com validações" ON convites_empresa IS 
'Permite criação de convites por admins autenticados ou usuários anônimos com validações rigorosas de segurança';

-- 4. Criar função para verificar políticas (para debugging)
CREATE OR REPLACE FUNCTION verificar_politicas_convites()
RETURNS TABLE(
    policy_name text,
    command text,
    permissive text,
    definition text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        policyname::text,
        cmd::text,
        CASE WHEN permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END::text,
        qual::text
    FROM pg_policies 
    WHERE tablename = 'convites_empresa' 
    AND cmd = 'INSERT';
$$;