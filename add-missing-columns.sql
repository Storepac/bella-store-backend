-- Script para adicionar colunas faltantes na tabela stores
-- Execute este script no banco de dados do Dokploy

USE bella_store;

-- Adicionar colunas faltantes na tabela stores
ALTER TABLE stores 
ADD COLUMN store_code VARCHAR(50) UNIQUE,
ADD COLUMN store_name VARCHAR(100),
ADD COLUMN store_description TEXT,
ADD COLUMN logo_url VARCHAR(255),
ADD COLUMN whatsapp_number VARCHAR(30),
ADD COLUMN address VARCHAR(255),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(50),
ADD COLUMN primary_color VARCHAR(20),
ADD COLUMN secondary_color VARCHAR(20),
ADD COLUMN domain VARCHAR(100),
ADD COLUMN subdomain VARCHAR(100),
ADD COLUMN settings JSON,
ADD COLUMN senha VARCHAR(255),
ADD COLUMN codigo VARCHAR(50),
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Atualizar dados existentes
UPDATE stores SET 
  store_name = name,
  store_description = description,
  logo_url = logo,
  whatsapp_number = whatsapp,
  address = endereco,
  is_active = isActive;

-- Verificar se foi adicionado corretamente
DESCRIBE stores; 