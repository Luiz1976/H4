-- Correção das políticas RLS para a tabela admins
-- Este script corrige os problemas de acesso para consultas de admins

-- 1. Garantir que RLS está habilitado
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Admins podem ver outros admins" ON admins;
DROP POLICY IF EXISTS "Admins podem inserir outros admins" ON admins;
DROP POLICY IF EXISTS "Admins podem ser consultados para login" ON admins;
DROP POLICY IF EXISTS "Permitir consulta de admins para autenticação" ON admins;

-- 3. Criar política SELECT permissiva para autenticação
-- Esta política permite consultas necessárias para o processo de login
CREATE POLICY "Permitir consulta de admins para autenticação" ON admins
    FOR SELECT
    USING (true);

-- 4. Criar política INSERT restritiva (apenas para admins existentes)
CREATE POLICY "Admins podem inserir outros admins" ON admins
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        (
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
            OR
            EXISTS (
                SELECT 1 FROM admins 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- 5. Criar política UPDATE restritiva (apenas para admins existentes)
CREATE POLICY "Admins podem atualizar outros admins" ON admins
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND 
        (
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
            OR
            EXISTS (
                SELECT 1 FROM admins 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- 6. Criar política DELETE restritiva (apenas para admins existentes)
CREATE POLICY "Admins podem deletar outros admins" ON admins
    FOR DELETE
    USING (
        auth.role() = 'authenticated' AND 
        (
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
            OR
            EXISTS (
                SELECT 1 FROM admins 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Comentários sobre a solução:
-- - A política SELECT é permissiva para permitir autenticação
-- - As outras operações são restritas apenas a admins autenticados
-- - Resolve o erro 400 que estava ocorrendo nas consultas de admin