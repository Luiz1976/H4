-- Correção das políticas RLS para a tabela empresas
-- Este script corrige os problemas de acesso durante o cadastro de empresas via convites

-- 1. Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Empresas podem ser lidas por usuários autenticados" ON empresas;
DROP POLICY IF EXISTS "Empresas podem ser criadas por usuários autenticados" ON empresas;
DROP POLICY IF EXISTS "Permitir leitura de empresas" ON empresas;
DROP POLICY IF EXISTS "Permitir criação de empresas" ON empresas;

-- 2. Criar política SELECT mais permissiva para verificação de empresas existentes
-- Permite que qualquer usuário autenticado verifique se um email já existe
CREATE POLICY "Permitir verificação de empresas existentes" ON empresas
    FOR SELECT
    USING (true);

-- 3. Criar política INSERT para permitir criação de empresas via convites
-- Permite que qualquer usuário autenticado crie uma empresa
CREATE POLICY "Permitir criação de empresas via convites" ON empresas
    FOR INSERT
    WITH CHECK (true);

-- 4. Criar política UPDATE para permitir atualizações da própria empresa
-- Permite que usuários atualizem apenas empresas onde são admin
CREATE POLICY "Permitir atualização da própria empresa" ON empresas
    FOR UPDATE
    USING (admin_id = auth.uid())
    WITH CHECK (admin_id = auth.uid());

-- 5. Criar política DELETE restritiva (apenas para admins da empresa)
CREATE POLICY "Permitir exclusão apenas pelo admin da empresa" ON empresas
    FOR DELETE
    USING (admin_id = auth.uid());

-- Verificar se RLS está habilitado
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Comentários sobre as políticas:
-- SELECT: Permissiva para permitir verificação de emails existentes durante cadastro
-- INSERT: Permissiva para permitir criação via convites (validação é feita na aplicação)
-- UPDATE/DELETE: Restritivas, apenas o admin da empresa pode modificar/excluir