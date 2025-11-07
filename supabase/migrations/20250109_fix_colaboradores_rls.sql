-- Migração para corrigir políticas RLS da tabela colaboradores
-- Resolve o erro "new row violates row-level security policy for table colaboradores"

-- 1. Remover política INSERT restritiva atual
DROP POLICY IF EXISTS "Empresas podem inserir colaboradores" ON colaboradores;

-- 2. Criar nova política INSERT permissiva para convites
CREATE POLICY "Permitir inserção de colaboradores" ON colaboradores
    FOR INSERT 
    WITH CHECK (
        -- Permitir se for empresa autenticada
        (
            auth.role() = 'authenticated' AND
            auth.jwt() ->> 'role' = 'empresa' AND 
            empresa_id::text = auth.jwt() ->> 'empresa_id'
        )
        OR
        -- OU permitir se existe convite válido para este colaborador
        (
            EXISTS (
                SELECT 1 FROM convites_colaborador 
                WHERE email = NEW.email 
                AND empresa_id = NEW.empresa_id
                AND status = 'pendente' 
                AND validade > NOW()
            )
        )
    );

-- 3. Remover políticas SELECT restritivas
DROP POLICY IF EXISTS "Colaboradores podem ver seus próprios dados" ON colaboradores;
DROP POLICY IF EXISTS "Empresas podem ver seus colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Admins podem ver todos os colaboradores" ON colaboradores;

-- 4. Recriar políticas SELECT mais permissivas

-- Política para admins
CREATE POLICY "Admins podem ver todos os colaboradores" ON colaboradores
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        auth.jwt() ->> 'role' = 'admin'
    );

-- Política para empresas
CREATE POLICY "Empresas podem ver seus colaboradores" ON colaboradores
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        auth.jwt() ->> 'role' = 'empresa' AND 
        empresa_id::text = auth.jwt() ->> 'empresa_id'
    );

-- Política para colaboradores
CREATE POLICY "Colaboradores podem ver seus próprios dados" ON colaboradores
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        auth.jwt() ->> 'role' = 'colaborador' AND 
        id::text = auth.jwt() ->> 'user_id'
    );

-- Política para verificação de emails (permite consultas anônimas para verificar emails existentes)
CREATE POLICY "Permitir verificação de emails existentes" ON colaboradores
    FOR SELECT USING (true);

-- Comentário explicativo
COMMENT ON POLICY "Permitir inserção de colaboradores" ON colaboradores IS 
'Permite inserção de colaboradores por empresas autenticadas ou através de convites válidos';

COMMENT ON POLICY "Permitir verificação de emails existentes" ON colaboradores IS 
'Permite verificação anônima de emails existentes durante o processo de cadastro';