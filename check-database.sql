-- Script para verificar e configurar o banco de dados
-- Execute estes comandos um por vez no MySQL

-- 1. Ver todos os bancos de dados
SHOW DATABASES;

-- 2. Selecionar o banco (substitua 'nome_do_banco' pelo nome correto)
-- USE nome_do_banco;

-- 3. Ver todas as tabelas
SHOW TABLES;

-- 4. Verificar se a tabela users existe
SHOW TABLES LIKE 'users';

-- 5. Ver estrutura da tabela users (se existir)
DESCRIBE users;

-- 6. Adicionar coluna isActive (execute apenas se a tabela users existir)
-- ALTER TABLE users ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE;

-- 7. Verificar se foi adicionada
-- DESCRIBE users; 