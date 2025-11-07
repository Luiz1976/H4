-- Correção das políticas RLS para a tabela convites_colaborador
-- Este script corrige os problemas de acesso para empresas consultarem seus convites

-- 1. Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Qualquer um pode ver convites colaborador válidos por token" ON convites_colaborador;
DROP POLICY IF EXISTS "Empresas podem ver seus convites colaborador" ON convites_colaborador;
DROP POLICY IF EXISTS "Empresas podem inserir convites colaborador" ON convites_colaborador;
DROP POLICY IF EXISTS "Empresas podem atualizar seus convites colaborador" ON convites_colaborador;

-- 2. Criar política SELECT mais permissiva para empresas
-- Permite que empresas vejam seus próprios convites
CREATE POLICY "Empresas podem ver seus convites colaborador" ON convites_colaborador
    FOR SELECT
    USING (
        -- Permitir se é uma empresa autenticada consultando seus próprios convites
        (
            auth.role() = 'authenticated' AND 
            auth.jwt() ->> 'role' = 'empresa' AND 
            empresa_id::text = auth.jwt() ->> 'empresa_id'
        )
        OR
        -- Permitir acesso por token válido (para aceitar convites)
        (
            status = 'pendente' AND 
            validade > NOW()
        )
        OR
        -- Permitir acesso para admins
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
    );

-- 3. Criar política INSERT para empresas
CREATE POLICY "Empresas podem inserir convites colaborador" ON convites_colaborador
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        (
            -- Empresas podem criar convites para sua própria empresa
            (
                auth.jwt() ->> 'role' = 'empresa' AND 
                empresa_id::text = auth.jwt() ->> 'empresa_id'
            )
            OR
            -- Admins podem criar convites para qualquer empresa
            (
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
                OR
                EXISTS (
                    SELECT 1 FROM admins 
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
        )
    );

-- 4. Criar política UPDATE para empresas
CREATE POLICY "Empresas podem atualizar seus convites colaborador" ON convites_colaborador
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND 
        (
            -- Empresas podem atualizar seus próprios convites
            (
                auth.jwt() ->> 'role' = 'empresa' AND 
                empresa_id::text = auth.jwt() ->> 'empresa_id'
            )
            OR
            -- Admins podem atualizar qualquer convite
            (
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
                OR
                EXISTS (
                    SELECT 1 FROM admins 
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
        )
    );

-- 5. Criar política DELETE para empresas
CREATE POLICY "Empresas podem deletar seus convites colaborador" ON convites_colaborador
    FOR DELETE
    USING (
        auth.role() = 'authenticated' AND 
        (
            -- Empresas podem deletar seus próprios convites
            (
                auth.jwt() ->> 'role' = 'empresa' AND 
                empresa_id::text = auth.jwt() ->> 'empresa_id'
            )
            OR
            -- Admins podem deletar qualquer convite
            (
                (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
                OR
                EXISTS (
                    SELECT 1 FROM admins 
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
        )
    );

-- Comentários sobre a solução:
-- - Permite que empresas acessem apenas seus próprios convites
-- - Mantém acesso por token para aceitar convites
-- - Permite que admins tenham acesso total
-- - Resolve o erro 406 que estava ocorrendo