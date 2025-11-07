-- Inserir administrador inicial no sistema HumaniQ
-- Data: 2025-01-08
-- Descrição: Criação do usuário administrador padrão para desenvolvimento

-- Verificar se já existe um admin com este email
DO $$
BEGIN
    -- Inserir admin inicial apenas se não existir
    IF NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@humaniq.com') THEN
        INSERT INTO admins (email, nome) 
        VALUES ('admin@humaniq.com', 'Administrador HumaniQ');
        
        RAISE NOTICE 'Administrador inicial criado com sucesso: admin@humaniq.com';
    ELSE
        RAISE NOTICE 'Administrador já existe: admin@humaniq.com';
    END IF;
END $$;

-- Verificar se o admin foi criado
SELECT 
    id,
    email,
    nome,
    created_at
FROM admins 
WHERE email = 'admin@humaniq.com';