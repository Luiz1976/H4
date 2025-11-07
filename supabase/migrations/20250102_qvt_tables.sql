-- Migração para criar tabelas específicas do teste QVT (Qualidade de Vida no Trabalho)
-- Criação das tabelas respostas_individuais_qvt e resultados_qvt

-- 1. Criar tabela para respostas individuais do QVT
CREATE TABLE IF NOT EXISTS respostas_individuais_qvt (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pergunta_id INTEGER NOT NULL CHECK (pergunta_id >= 1 AND pergunta_id <= 50),
    resposta INTEGER NOT NULL CHECK (resposta >= 1 AND resposta <= 5),
    dimensao VARCHAR(100) NOT NULL,
    tempo_resposta INTEGER, -- em milissegundos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar respostas duplicadas por sessão/pergunta
    UNIQUE(session_id, pergunta_id)
);

-- 2. Criar tabela para resultados finais do QVT
CREATE TABLE IF NOT EXISTS resultados_qvt (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Resultado geral
    indice_geral DECIMAL(3,2) NOT NULL CHECK (indice_geral >= 1.0 AND indice_geral <= 5.0),
    nivel_geral VARCHAR(50) NOT NULL,
    percentual_geral DECIMAL(5,2) NOT NULL,
    
    -- Dimensões (5 dimensões do QVT)
    satisfacao_funcao DECIMAL(3,2) NOT NULL,
    relacao_lideranca DECIMAL(3,2) NOT NULL,
    estrutura_condicoes DECIMAL(3,2) NOT NULL,
    recompensas_remuneracao DECIMAL(3,2) NOT NULL,
    equilibrio_vida_trabalho DECIMAL(3,2) NOT NULL,
    
    -- Análises
    dimensoes_criticas TEXT[], -- Array de dimensões que precisam atenção
    pontos_fortes TEXT[], -- Array de pontos fortes identificados
    risco_turnover BOOLEAN DEFAULT FALSE,
    
    -- Metadados
    total_perguntas INTEGER DEFAULT 50,
    tempo_total INTEGER, -- tempo total em milissegundos
    recomendacoes JSONB, -- Recomendações estruturadas
    insights JSONB, -- Insights detalhados
    alertas_criticos JSONB, -- Alertas críticos identificados
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_respostas_qvt_session 
ON respostas_individuais_qvt(session_id);

CREATE INDEX IF NOT EXISTS idx_respostas_qvt_usuario 
ON respostas_individuais_qvt(usuario_id);

CREATE INDEX IF NOT EXISTS idx_respostas_qvt_pergunta 
ON respostas_individuais_qvt(pergunta_id);

CREATE INDEX IF NOT EXISTS idx_respostas_qvt_dimensao 
ON respostas_individuais_qvt(dimensao);

CREATE INDEX IF NOT EXISTS idx_respostas_qvt_created 
ON respostas_individuais_qvt(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resultados_qvt_session 
ON resultados_qvt(session_id);

CREATE INDEX IF NOT EXISTS idx_resultados_qvt_usuario 
ON resultados_qvt(usuario_id);

CREATE INDEX IF NOT EXISTS idx_resultados_qvt_indice 
ON resultados_qvt(indice_geral DESC);

CREATE INDEX IF NOT EXISTS idx_resultados_qvt_nivel 
ON resultados_qvt(nivel_geral);

CREATE INDEX IF NOT EXISTS idx_resultados_qvt_created 
ON resultados_qvt(created_at DESC);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE respostas_individuais_qvt ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_qvt ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para respostas_individuais_qvt
CREATE POLICY "Inserção de respostas QVT permitida" ON respostas_individuais_qvt
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Leitura respostas QVT por usuário ou sessão" ON respostas_individuais_qvt
    FOR SELECT USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

CREATE POLICY "Atualização respostas QVT próprias" ON respostas_individuais_qvt
    FOR UPDATE USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

CREATE POLICY "Exclusão respostas QVT próprias" ON respostas_individuais_qvt
    FOR DELETE USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- 6. Políticas RLS para resultados_qvt
CREATE POLICY "Inserção resultados QVT permitida" ON resultados_qvt
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Leitura resultados QVT por usuário ou sessão" ON resultados_qvt
    FOR SELECT USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

CREATE POLICY "Atualização resultados QVT próprios" ON resultados_qvt
    FOR UPDATE USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- 7. Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_respostas_qvt_updated_at 
    BEFORE UPDATE ON respostas_individuais_qvt 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resultados_qvt_updated_at 
    BEFORE UPDATE ON resultados_qvt 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Comentários nas tabelas e colunas
COMMENT ON TABLE respostas_individuais_qvt IS 'Respostas individuais do teste QVT - Qualidade de Vida no Trabalho';
COMMENT ON COLUMN respostas_individuais_qvt.session_id IS 'ID da sessão do usuário';
COMMENT ON COLUMN respostas_individuais_qvt.pergunta_id IS 'Número da pergunta (1-50)';
COMMENT ON COLUMN respostas_individuais_qvt.resposta IS 'Resposta na escala Likert (1-5)';
COMMENT ON COLUMN respostas_individuais_qvt.dimensao IS 'Dimensão QVT da pergunta';
COMMENT ON COLUMN respostas_individuais_qvt.tempo_resposta IS 'Tempo para responder em milissegundos';

COMMENT ON TABLE resultados_qvt IS 'Resultados finais do teste QVT - Qualidade de Vida no Trabalho';
COMMENT ON COLUMN resultados_qvt.indice_geral IS 'Índice geral QVT (1.0-5.0)';
COMMENT ON COLUMN resultados_qvt.nivel_geral IS 'Classificação do nível QVT';
COMMENT ON COLUMN resultados_qvt.percentual_geral IS 'Percentual geral de satisfação';
COMMENT ON COLUMN resultados_qvt.satisfacao_funcao IS 'Pontuação da dimensão Satisfação com a Função';
COMMENT ON COLUMN resultados_qvt.relacao_lideranca IS 'Pontuação da dimensão Relação com Liderança';
COMMENT ON COLUMN resultados_qvt.estrutura_condicoes IS 'Pontuação da dimensão Estrutura e Condições';
COMMENT ON COLUMN resultados_qvt.recompensas_remuneracao IS 'Pontuação da dimensão Recompensas e Remuneração';
COMMENT ON COLUMN resultados_qvt.equilibrio_vida_trabalho IS 'Pontuação da dimensão Equilíbrio Vida-Trabalho';
COMMENT ON COLUMN resultados_qvt.risco_turnover IS 'Indica se há risco de turnover detectado';

-- 9. Função para obter estatísticas do QVT
CREATE OR REPLACE FUNCTION get_qvt_statistics()
RETURNS TABLE(
    total_testes BIGINT,
    media_indice_geral DECIMAL,
    distribuicao_niveis JSONB,
    dimensao_mais_critica TEXT,
    taxa_risco_turnover DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_testes,
        AVG(indice_geral) as media_indice_geral,
        jsonb_build_object(
            'Muito Alto', COUNT(*) FILTER (WHERE nivel_geral = 'Muito Alto'),
            'Alto', COUNT(*) FILTER (WHERE nivel_geral = 'Alto'),
            'Médio', COUNT(*) FILTER (WHERE nivel_geral = 'Médio'),
            'Baixo', COUNT(*) FILTER (WHERE nivel_geral = 'Baixo'),
            'Muito Baixo', COUNT(*) FILTER (WHERE nivel_geral = 'Muito Baixo')
        ) as distribuicao_niveis,
        (
            SELECT dimensao 
            FROM (
                SELECT unnest(dimensoes_criticas) as dimensao, COUNT(*) as freq
                FROM resultados_qvt 
                WHERE dimensoes_criticas IS NOT NULL
                GROUP BY dimensao
                ORDER BY freq DESC
                LIMIT 1
            ) sub
        ) as dimensao_mais_critica,
        (COUNT(*) FILTER (WHERE risco_turnover = true) * 100.0 / NULLIF(COUNT(*), 0)) as taxa_risco_turnover
    FROM resultados_qvt
    WHERE created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 10. Conceder permissões para roles anônimas e autenticadas
GRANT SELECT, INSERT, UPDATE, DELETE ON respostas_individuais_qvt TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON resultados_qvt TO anon, authenticated;

-- Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Tabelas QVT criadas com sucesso!';
    RAISE NOTICE '📊 Tabela respostas_individuais_qvt: Armazena respostas individuais (1-50)';
    RAISE NOTICE '📈 Tabela resultados_qvt: Armazena resultados finais com 5 dimensões';
    RAISE NOTICE '🔍 Índices criados para otimização de consultas';
    RAISE NOTICE '🔒 Políticas RLS configuradas para segurança';
    RAISE NOTICE '⚡ Triggers de updated_at configurados';
    RAISE NOTICE '📋 Função de estatísticas QVT disponível: get_qvt_statistics()';
    RAISE NOTICE '🎯 Permissões concedidas para anon e authenticated';
END $$;