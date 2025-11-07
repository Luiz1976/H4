-- Migração para HumaniQ RPO - Tabela especializada e dados iniciais
-- Baseada na Arquitetura Técnica de Padronização RPO

-- Inserir teste RPO (apenas se não existir)
INSERT INTO testes (nome, descricao, categoria, tempo_estimado)
SELECT 
    'HumaniQ RPO - Riscos Psicossociais Ocupacionais',
    'Avaliação científica dos fatores psicossociais no ambiente de trabalho baseada em normas ISO 10075 e diretrizes da OIT.',
    'Riscos Psicossociais',
    20
WHERE NOT EXISTS (
    SELECT 1 FROM testes WHERE nome = 'HumaniQ RPO - Riscos Psicossociais Ocupacionais'
);

-- Criar tabela específica para resultados RPO
CREATE TABLE IF NOT EXISTS resultados_rpo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resultado_id UUID REFERENCES resultados(id) ON DELETE CASCADE,
    indice_geral DECIMAL(5,2) NOT NULL,
    nivel_risco VARCHAR(50) NOT NULL,
    pontuacoes_dimensoes JSONB NOT NULL,
    analise_detalhada JSONB,
    recomendacoes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance na tabela resultados_rpo
CREATE INDEX IF NOT EXISTS idx_resultados_rpo_resultado_id ON resultados_rpo(resultado_id);
CREATE INDEX IF NOT EXISTS idx_resultados_rpo_nivel_risco ON resultados_rpo(nivel_risco);

-- Habilitar RLS (Row Level Security)
ALTER TABLE testes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_rpo ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança Supabase

-- Política para leitura de testes (público)
DROP POLICY IF EXISTS "Leitura pública de testes" ON testes;
CREATE POLICY "Leitura pública de testes" ON testes
    FOR SELECT USING (true);

-- Política para inserção de resultados
DROP POLICY IF EXISTS "Inserção de resultados permitida" ON resultados;
CREATE POLICY "Inserção de resultados permitida" ON resultados
    FOR INSERT WITH CHECK (true);

-- Política para leitura de resultados
DROP POLICY IF EXISTS "Leitura de resultados próprios" ON resultados;
CREATE POLICY "Leitura de resultados próprios" ON resultados
    FOR SELECT USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- Política para atualização de resultados
DROP POLICY IF EXISTS "Atualização de resultados próprios" ON resultados;
CREATE POLICY "Atualização de resultados próprios" ON resultados
    FOR UPDATE USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- Política para inserção de respostas
DROP POLICY IF EXISTS "Inserção de respostas permitida" ON respostas;
CREATE POLICY "Inserção de respostas permitida" ON respostas
    FOR INSERT WITH CHECK (true);

-- Política para leitura de respostas
DROP POLICY IF EXISTS "Leitura de respostas próprias" ON respostas;
CREATE POLICY "Leitura de respostas próprias" ON respostas
    FOR SELECT USING (true);

-- Política para resultados RPO - inserção
DROP POLICY IF EXISTS "Inserção de resultados RPO permitida" ON resultados_rpo;
CREATE POLICY "Inserção de resultados RPO permitida" ON resultados_rpo
    FOR INSERT WITH CHECK (true);

-- Política para resultados RPO - leitura
DROP POLICY IF EXISTS "Leitura de resultados RPO" ON resultados_rpo;
CREATE POLICY "Leitura de resultados RPO" ON resultados_rpo
    FOR SELECT USING (true);

-- Garantir permissões para roles anônimos e autenticados
GRANT SELECT ON testes TO anon, authenticated;
GRANT ALL ON resultados TO anon, authenticated;
GRANT ALL ON respostas TO anon, authenticated;
GRANT ALL ON resultados_rpo TO anon, authenticated;

-- Garantir permissões para sequências
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;