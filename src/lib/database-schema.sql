-- Script SQL para criar as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- Tabela de testes
CREATE TABLE IF NOT EXISTS testes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    tempo_estimado INTEGER, -- em minutos
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perguntas
CREATE TABLE IF NOT EXISTS perguntas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teste_id UUID REFERENCES testes(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'multipla_escolha', -- multipla_escolha, escala, texto_livre
    opcoes JSONB, -- Para armazenar opções de múltipla escolha
    ordem INTEGER NOT NULL,
    obrigatoria BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de resultados
CREATE TABLE IF NOT EXISTS resultados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teste_id UUID REFERENCES testes(id) ON DELETE CASCADE,
    usuario_id UUID, -- Pode ser NULL para usuários anônimos
    pontuacao_total INTEGER,
    tempo_gasto INTEGER, -- em segundos
    data_realizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'concluido',
    metadados JSONB -- Para informações adicionais
);

-- Tabela de respostas
CREATE TABLE IF NOT EXISTS respostas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resultado_id UUID REFERENCES resultados(id) ON DELETE CASCADE,
    pergunta_id UUID REFERENCES perguntas(id) ON DELETE CASCADE,
    resposta TEXT NOT NULL,
    pontuacao INTEGER,
    tempo_resposta INTEGER, -- em segundos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_perguntas_teste_id ON perguntas(teste_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_ordem ON perguntas(teste_id, ordem);
CREATE INDEX IF NOT EXISTS idx_resultados_teste_id ON resultados(teste_id);
CREATE INDEX IF NOT EXISTS idx_resultados_data ON resultados(data_realizacao);
CREATE INDEX IF NOT EXISTS idx_respostas_resultado_id ON respostas(resultado_id);
CREATE INDEX IF NOT EXISTS idx_respostas_pergunta_id ON respostas(pergunta_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela testes
DROP TRIGGER IF EXISTS update_testes_updated_at ON testes;
CREATE TRIGGER update_testes_updated_at 
    BEFORE UPDATE ON testes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo (opcional)
INSERT INTO testes (id, nome, descricao, categoria, tempo_estimado) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Teste de Personalidade DISC', 'Avalie seu perfil comportamental através do modelo DISC', 'Personalidade', 15),
('550e8400-e29b-41d4-a716-446655440001', 'Avaliação de Competências Técnicas', 'Teste suas habilidades técnicas em diferentes áreas', 'Competências', 30),
('550e8400-e29b-41d4-a716-446655440002', 'Teste de Inteligência Emocional', 'Meça sua capacidade de reconhecer e gerenciar emoções', 'Inteligência Emocional', 20)
ON CONFLICT (id) DO NOTHING;

-- Inserir perguntas de exemplo para o teste DISC
INSERT INTO perguntas (teste_id, texto, tipo, opcoes, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Como você prefere trabalhar em equipe?', 'multipla_escolha', 
 '["Lidero e tomo decisões rapidamente", "Colaboro e busco harmonia", "Analiso dados antes de agir", "Sigo procedimentos estabelecidos"]', 1),
('550e8400-e29b-41d4-a716-446655440000', 'Em situações de pressão, você:', 'multipla_escolha', 
 '["Age rapidamente e assume riscos", "Mantém o otimismo e motiva outros", "Busca informações detalhadas", "Segue protocolos de segurança"]', 2),
('550e8400-e29b-41d4-a716-446655440000', 'Seu estilo de comunicação é:', 'multipla_escolha', 
 '["Direto e objetivo", "Entusiástico e expressivo", "Cuidadoso e preciso", "Paciente e estável"]', 3)
ON CONFLICT DO NOTHING;

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE testes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de testes ativos
CREATE POLICY "Testes ativos são públicos" ON testes
    FOR SELECT USING (ativo = true);

-- Política para permitir leitura pública de perguntas
CREATE POLICY "Perguntas são públicas" ON perguntas
    FOR SELECT USING (true);

-- Política para permitir inserção de resultados
CREATE POLICY "Qualquer um pode inserir resultados" ON resultados
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de resultados próprios
CREATE POLICY "Usuários podem ver seus resultados" ON resultados
    FOR SELECT USING (true); -- Ajustar conforme necessário para autenticação

-- Política para permitir inserção de respostas
CREATE POLICY "Qualquer um pode inserir respostas" ON respostas
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de respostas
CREATE POLICY "Respostas são legíveis" ON respostas
    FOR SELECT USING (true);

-- Comentários nas tabelas
COMMENT ON TABLE testes IS 'Armazena os diferentes tipos de testes disponíveis';
COMMENT ON TABLE perguntas IS 'Contém as perguntas de cada teste';
COMMENT ON TABLE resultados IS 'Registra os resultados dos testes realizados';
COMMENT ON TABLE respostas IS 'Armazena as respostas individuais de cada pergunta';