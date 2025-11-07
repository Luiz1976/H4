-- Migração para implementar persistência permanente de resultados
-- Adiciona campos necessários para identificação por sessão e otimizações

-- 1. Adicionar campos para persistência por sessão
ALTER TABLE resultados 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS ip_address INET;

-- 2. Criar índices para otimizar consultas de histórico
CREATE INDEX IF NOT EXISTS idx_resultados_usuario_data 
ON resultados(usuario_id, data_realizacao DESC);

CREATE INDEX IF NOT EXISTS idx_resultados_session_data 
ON resultados(session_id, data_realizacao DESC);

CREATE INDEX IF NOT EXISTS idx_resultados_teste_data 
ON resultados(teste_id, data_realizacao DESC);

CREATE INDEX IF NOT EXISTS idx_resultados_status 
ON resultados(status);

CREATE INDEX IF NOT EXISTS idx_resultados_pontuacao 
ON resultados(pontuacao_total);

-- 3. Atualizar políticas RLS para permitir acesso por sessão
DROP POLICY IF EXISTS "Usuários podem ver seus resultados" ON resultados;

-- Política para leitura de resultados (por usuário ou sessão)
CREATE POLICY "Acesso por usuário ou sessão" ON resultados
    FOR SELECT USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL OR
        session_id IS NULL
    );

-- Política para inserção de resultados (permitir qualquer inserção)
DROP POLICY IF EXISTS "Qualquer um pode inserir resultados" ON resultados;
CREATE POLICY "Inserção de resultados permitida" ON resultados
    FOR INSERT WITH CHECK (true);

-- Política para atualização de resultados (apenas próprios resultados)
CREATE POLICY "Atualização de resultados próprios" ON resultados
    FOR UPDATE USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- 4. Inserir dados dos testes existentes (apenas se não existirem)
INSERT INTO testes (nome, descricao, categoria, tempo_estimado) 
SELECT 'HumaniQ Clima Organizacional', 'Avaliação completa do clima organizacional', 'Organizacional', 25
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'HumaniQ Clima Organizacional')
UNION ALL
SELECT 'Modelo Karasek-Siegrist', 'Avaliação de estresse ocupacional', 'Bem-estar', 20
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'Modelo Karasek-Siegrist')
UNION ALL
SELECT 'Percepção de Assédio (PAS)', 'Avaliação de percepção de assédio moral e sexual', 'Segurança', 30
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'Percepção de Assédio (PAS)')
UNION ALL
SELECT 'Riscos Psicossociais Ocupacionais (RPO)', 'Identificação de riscos psicossociais no trabalho', 'Segurança', 35
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'Riscos Psicossociais Ocupacionais (RPO)')
UNION ALL
SELECT 'Qualidade de Vida no Trabalho (QVT)', 'Avaliação da qualidade de vida no ambiente de trabalho', 'Bem-estar', 25
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'Qualidade de Vida no Trabalho (QVT)')
UNION ALL
SELECT 'Estresse Ocupacional', 'Avaliação de níveis de estresse no trabalho', 'Bem-estar', 20
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'Estresse Ocupacional')
UNION ALL
SELECT 'Clima e Bem-Estar', 'Avaliação do clima e bem-estar organizacional', 'Organizacional', 30
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'Clima e Bem-Estar')
UNION ALL
SELECT 'MGRP - Modelo de Gestão de Riscos Psicossociais', 'Avaliação completa de riscos psicossociais', 'Segurança', 40
WHERE NOT EXISTS (SELECT 1 FROM testes WHERE nome = 'MGRP - Modelo de Gestão de Riscos Psicossociais');

-- 5. Função para limpeza de dados antigos (opcional - executar manualmente)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_results()
RETURNS void AS $$
BEGIN
    DELETE FROM resultados 
    WHERE usuario_id IS NULL 
    AND session_id IS NOT NULL 
    AND data_realizacao < NOW() - INTERVAL '90 days';
    
    RAISE NOTICE 'Limpeza concluída. Resultados anônimos com mais de 90 dias foram removidos.';
END;
$$ LANGUAGE plpgsql;

-- 6. Função para estatísticas de uso (opcional)
CREATE OR REPLACE FUNCTION get_usage_statistics()
RETURNS TABLE(
    total_resultados BIGINT,
    resultados_anonimos BIGINT,
    resultados_identificados BIGINT,
    testes_mais_populares TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_resultados,
        COUNT(*) FILTER (WHERE usuario_id IS NULL AND session_id IS NOT NULL) as resultados_anonimos,
        COUNT(*) FILTER (WHERE usuario_id IS NOT NULL) as resultados_identificados,
        ARRAY_AGG(DISTINCT teste_id ORDER BY teste_id) as testes_mais_populares
    FROM resultados
    WHERE data_realizacao >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 7. Comentários nas novas colunas
COMMENT ON COLUMN resultados.session_id IS 'Identificador único de sessão para usuários anônimos';
COMMENT ON COLUMN resultados.user_agent IS 'User agent do navegador para análise de uso';
COMMENT ON COLUMN resultados.ip_address IS 'Endereço IP do usuário (opcional, para auditoria)';

-- 8. Verificar se as políticas estão ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'resultados';

-- Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Migração de persistência de resultados concluída com sucesso!';
    RAISE NOTICE '📊 Campos adicionados: session_id, user_agent, ip_address';
    RAISE NOTICE '🔍 Índices criados para otimização de consultas';
    RAISE NOTICE '🔒 Políticas RLS atualizadas para suporte a sessões';
    RAISE NOTICE '📋 Dados de testes atualizados';
END $$;