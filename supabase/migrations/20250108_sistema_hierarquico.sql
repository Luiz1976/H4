-- Migração para Sistema Hierárquico de Gestão de Usuários HumaniQ
-- Data: 2025-01-08
-- Descrição: Criação de estrutura hierárquica com Admin, Empresa e Colaborador

-- =====================================================
-- 1. TABELA DE ADMINISTRADORES
-- =====================================================

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para admins
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- RLS para admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admins
CREATE POLICY "Admins podem ver todos os admins" ON admins
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem inserir novos admins" ON admins
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem atualizar admins" ON admins
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 2. TABELA DE EMPRESAS
-- =====================================================

CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_empresa VARCHAR(255) NOT NULL,
    email_contato VARCHAR(255) UNIQUE NOT NULL,
    admin_id UUID REFERENCES admins(id),
    configuracoes JSONB DEFAULT '{}',
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_empresas_admin_id ON empresas(admin_id);
CREATE INDEX IF NOT EXISTS idx_empresas_email ON empresas(email_contato);
CREATE INDEX IF NOT EXISTS idx_empresas_ativa ON empresas(ativa);

-- RLS para empresas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para empresas
CREATE POLICY "Admins podem ver todas as empresas" ON empresas
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Empresas podem ver seus próprios dados" ON empresas
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'empresa' AND 
        id::text = auth.jwt() ->> 'empresa_id'
    );

CREATE POLICY "Admins podem inserir empresas" ON empresas
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem atualizar empresas" ON empresas
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 3. TABELA DE COLABORADORES
-- =====================================================

CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cargo VARCHAR(255),
    departamento VARCHAR(255),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    permissoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para colaboradores
CREATE INDEX IF NOT EXISTS idx_colaboradores_empresa_id ON colaboradores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON colaboradores(email);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo ON colaboradores(ativo);

-- RLS para colaboradores
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para colaboradores
CREATE POLICY "Admins podem ver todos os colaboradores" ON colaboradores
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Empresas podem ver seus colaboradores" ON colaboradores
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'empresa' AND 
        empresa_id::text = auth.jwt() ->> 'empresa_id'
    );

CREATE POLICY "Colaboradores podem ver seus próprios dados" ON colaboradores
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'colaborador' AND 
        id::text = auth.jwt() ->> 'user_id'
    );

CREATE POLICY "Empresas podem inserir colaboradores" ON colaboradores
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'empresa' AND 
        empresa_id::text = auth.jwt() ->> 'empresa_id'
    );

CREATE POLICY "Empresas podem atualizar seus colaboradores" ON colaboradores
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'empresa' AND 
        empresa_id::text = auth.jwt() ->> 'empresa_id'
    );

-- =====================================================
-- 4. TABELA DE CONVITES EMPRESARIAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS convites_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    nome_empresa VARCHAR(255) NOT NULL,
    email_contato VARCHAR(255) NOT NULL,
    admin_id UUID REFERENCES admins(id),
    validade TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado', 'cancelado')),
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para convites empresa
CREATE INDEX IF NOT EXISTS idx_convites_empresa_token ON convites_empresa(token);
CREATE INDEX IF NOT EXISTS idx_convites_empresa_status ON convites_empresa(status);
CREATE INDEX IF NOT EXISTS idx_convites_empresa_validade ON convites_empresa(validade);
CREATE INDEX IF NOT EXISTS idx_convites_empresa_admin_id ON convites_empresa(admin_id);

-- RLS para convites empresa
ALTER TABLE convites_empresa ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para convites empresa
CREATE POLICY "Qualquer um pode ver convites válidos por token" ON convites_empresa
    FOR SELECT USING (
        status = 'pendente' AND 
        validade > NOW()
    );

CREATE POLICY "Admins podem ver todos os convites empresa" ON convites_empresa
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem inserir convites empresa" ON convites_empresa
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem atualizar convites empresa" ON convites_empresa
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 5. TABELA DE CONVITES DE COLABORADORES
-- =====================================================

CREATE TABLE IF NOT EXISTS convites_colaborador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cargo VARCHAR(255),
    departamento VARCHAR(255),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    validade TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado', 'cancelado')),
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para convites colaborador
CREATE INDEX IF NOT EXISTS idx_convites_colaborador_token ON convites_colaborador(token);
CREATE INDEX IF NOT EXISTS idx_convites_colaborador_empresa_id ON convites_colaborador(empresa_id);
CREATE INDEX IF NOT EXISTS idx_convites_colaborador_status ON convites_colaborador(status);
CREATE INDEX IF NOT EXISTS idx_convites_colaborador_validade ON convites_colaborador(validade);

-- RLS para convites colaborador
ALTER TABLE convites_colaborador ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para convites colaborador
CREATE POLICY "Qualquer um pode ver convites colaborador válidos por token" ON convites_colaborador
    FOR SELECT USING (
        status = 'pendente' AND 
        validade > NOW()
    );

CREATE POLICY "Empresas podem ver seus convites colaborador" ON convites_colaborador
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'empresa' AND 
        empresa_id::text = auth.jwt() ->> 'empresa_id'
    );

CREATE POLICY "Empresas podem inserir convites colaborador" ON convites_colaborador
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'empresa' AND 
        empresa_id::text = auth.jwt() ->> 'empresa_id'
    );

CREATE POLICY "Empresas podem atualizar seus convites colaborador" ON convites_colaborador
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'empresa' AND 
        empresa_id::text = auth.jwt() ->> 'empresa_id'
    );

-- =====================================================
-- 6. TABELA DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabela VARCHAR(100) NOT NULL,
    operacao VARCHAR(20) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id UUID,
    usuario_tipo VARCHAR(50),
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela ON auditoria(tabela);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria(created_at);

-- RLS para auditoria
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para auditoria
CREATE POLICY "Admins podem ver toda auditoria" ON auditoria
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 7. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave VARCHAR(255) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para configurações
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes_sistema(chave);

-- RLS para configurações
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configurações
CREATE POLICY "Admins podem ver configurações" ON configuracoes_sistema
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem inserir configurações" ON configuracoes_sistema
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem atualizar configurações" ON configuracoes_sistema
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 8. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes_sistema
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para gerar token único
CREATE OR REPLACE FUNCTION generate_unique_token(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se convite é válido
CREATE OR REPLACE FUNCTION is_convite_valido(token_convite TEXT, tipo_convite TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    convite_count INTEGER;
BEGIN
    IF tipo_convite = 'empresa' THEN
        SELECT COUNT(*) INTO convite_count
        FROM convites_empresa
        WHERE token = token_convite
        AND status = 'pendente'
        AND validade > NOW();
    ELSIF tipo_convite = 'colaborador' THEN
        SELECT COUNT(*) INTO convite_count
        FROM convites_colaborador
        WHERE token = token_convite
        AND status = 'pendente'
        AND validade > NOW();
    ELSE
        RETURN FALSE;
    END IF;
    
    RETURN convite_count > 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. DADOS INICIAIS
-- =====================================================

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave, valor, descricao) VALUES
('convite_empresa_validade_dias', '7', 'Validade padrão dos convites de empresa em dias'),
('convite_colaborador_validade_dias', '3', 'Validade padrão dos convites de colaborador em dias'),
('max_colaboradores_por_empresa', '1000', 'Número máximo de colaboradores por empresa'),
('sistema_manutencao', 'false', 'Indica se o sistema está em manutenção')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- 11. PERMISSÕES FINAIS
-- =====================================================

-- Conceder permissões básicas para roles anon e authenticated
GRANT SELECT ON convites_empresa TO anon;
GRANT SELECT ON convites_colaborador TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comentários nas tabelas
COMMENT ON TABLE admins IS 'Administradores gerais do sistema';
COMMENT ON TABLE empresas IS 'Empresas cadastradas no sistema';
COMMENT ON TABLE colaboradores IS 'Colaboradores das empresas';
COMMENT ON TABLE convites_empresa IS 'Convites para cadastro de empresas';
COMMENT ON TABLE convites_colaborador IS 'Convites para cadastro de colaboradores';
COMMENT ON TABLE auditoria IS 'Log de auditoria de todas as operações';
COMMENT ON TABLE configuracoes_sistema IS 'Configurações gerais do sistema';