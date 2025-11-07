-- Correção das políticas RLS para permitir consultas de login
-- Problema: As políticas RLS estão bloqueando consultas necessárias para autenticação
-- Solução: Permitir consultas SELECT para login sem autenticação prévia

-- 1. Política para tabela admins - permitir consulta por email para login
DROP POLICY IF EXISTS "Admins podem ser consultados para login" ON public.admins;
CREATE POLICY "Admins podem ser consultados para login" 
ON public.admins FOR SELECT 
USING (true);

-- 2. Política para tabela empresas - permitir consulta por email_contato para login
DROP POLICY IF EXISTS "Empresas podem ser consultadas para login" ON public.empresas;
CREATE POLICY "Empresas podem ser consultadas para login" 
ON public.empresas FOR SELECT 
USING (true);

-- 3. Política para tabela colaboradores - permitir consulta por email para login
DROP POLICY IF EXISTS "Colaboradores podem ser consultados para login" ON public.colaboradores;
CREATE POLICY "Colaboradores podem ser consultados para login" 
ON public.colaboradores FOR SELECT 
USING (true);

-- Comentários sobre a solução:
-- - Estas políticas permitem consultas SELECT sem autenticação prévia
-- - São necessárias para o processo de login funcionar corretamente
-- - O sistema precisa consultar essas tabelas PARA fazer a autenticação
-- - Sem essas políticas, temos um problema chicken-and-egg: 
--   precisamos estar autenticado para consultar as tabelas que fazem a autenticação