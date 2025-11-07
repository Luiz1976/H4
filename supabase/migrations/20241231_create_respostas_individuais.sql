-- Criar tabela para armazenar respostas individuais durante os testes
-- Esta tabela permite salvar respostas em tempo real conforme o usuário responde

CREATE TABLE IF NOT EXISTS respostas_individuais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teste_id VARCHAR(255) NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    pergunta_id VARCHAR(255) NOT NULL,
    resposta TEXT NOT NULL,
    pontuacao INTEGER,
    tempo_resposta INTEGER, -- em milissegundos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_respostas_individuais_session 
ON respostas_individuais(session_id);

CREATE INDEX IF NOT EXISTS idx_respostas_individuais_teste 
ON respostas_individuais(teste_id);

CREATE INDEX IF NOT EXISTS idx_respostas_individuais_usuario 
ON respostas_individuais(usuario_id);

CREATE INDEX IF NOT EXISTS idx_respostas_individuais_pergunta 
ON respostas_individuais(pergunta_id);

CREATE INDEX IF NOT EXISTS idx_respostas_individuais_created 
ON respostas_individuais(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE respostas_individuais ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de respostas (qualquer usuário pode inserir)
CREATE POLICY "Inserção de respostas individuais permitida" ON respostas_individuais
    FOR INSERT WITH CHECK (true);

-- Política para leitura de respostas (por usuário ou sessão)
CREATE POLICY "Leitura por usuário ou sessão" ON respostas_individuais
    FOR SELECT USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- Política para atualização de respostas (apenas próprias respostas)
CREATE POLICY "Atualização de respostas próprias" ON respostas_individuais
    FOR UPDATE USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- Política para exclusão de respostas (apenas próprias respostas)
CREATE POLICY "Exclusão de respostas próprias" ON respostas_individuais
    FOR DELETE USING (
        usuario_id::text = auth.uid()::text OR 
        session_id = current_setting('app.session_id', true) OR
        usuario_id IS NULL
    );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_respostas_individuais_updated_at 
    BEFORE UPDATE ON respostas_individuais 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários na tabela e colunas
COMMENT ON TABLE respostas_individuais IS 'Armazena respostas individuais dos usuários durante os testes';
COMMENT ON COLUMN respostas_individuais.teste_id IS 'Identificador do teste';
COMMENT ON COLUMN respostas_individuais.usuario_id IS 'ID do usuário autenticado (opcional)';
COMMENT ON COLUMN respostas_individuais.session_id IS 'ID da sessão para usuários anônimos';
COMMENT ON COLUMN respostas_individuais.pergunta_id IS 'Identificador da pergunta';
COMMENT ON COLUMN respostas_individuais.resposta IS 'Resposta do usuário (texto)';
COMMENT ON COLUMN respostas_individuais.pontuacao IS 'Pontuação numérica da resposta';
COMMENT ON COLUMN respostas_individuais.tempo_resposta IS 'Tempo gasto para responder em milissegundos';

-- Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Tabela respostas_individuais criada com sucesso!';
    RAISE NOTICE '🔍 Índices criados para otimização';
    RAISE NOTICE '🔒 Políticas RLS configuradas';
    RAISE NOTICE '⚡ Trigger de updated_at configurado';
END $$;