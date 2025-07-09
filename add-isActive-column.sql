-- Script para adicionar a coluna isActive na tabela users
-- Execute este script no banco de dados do Dokploy

-- Verificar se a coluna já existe
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'isActive';

-- Adicionar a coluna isActive se não existir
ALTER TABLE users 
ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE;

-- Atualizar registros existentes
UPDATE users SET isActive = TRUE WHERE isActive IS NULL;

-- Verificar se foi adicionada corretamente
DESCRIBE users; 