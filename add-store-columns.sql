-- Adicionar colunas necessárias na tabela stores
ALTER TABLE stores 
ADD COLUMN store_code VARCHAR(50) UNIQUE AFTER name,
ADD COLUMN codigo VARCHAR(50) UNIQUE AFTER store_code,
ADD COLUMN senha VARCHAR(255) AFTER codigo;

-- Atualizar dados existentes
UPDATE stores SET 
store_code = CONCAT('STORE', LPAD(id, 3, '0')),
codigo = CONCAT('STORE', LPAD(id, 3, '0')),
senha = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5QqQqQq' -- senha: 123
WHERE store_code IS NULL; 