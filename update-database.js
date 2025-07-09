import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'bella-mysql-2zfoqj',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gzsexpaiz33cirzeorjk2iuhzawiq1na',
  database: process.env.DB_NAME || 'bella_store'
};

async function updateDatabase() {
  console.log('🔧 Atualizando estrutura do banco de dados...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar se as colunas já existem
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'stores'
    `, [process.env.DB_NAME || 'bella_store']);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    if (!columnNames.includes('store_code')) {
      console.log('➕ Adicionando coluna store_code...');
      await connection.execute('ALTER TABLE stores ADD COLUMN store_code VARCHAR(50) UNIQUE AFTER name');
    }
    
    if (!columnNames.includes('codigo')) {
      console.log('➕ Adicionando coluna codigo...');
      await connection.execute('ALTER TABLE stores ADD COLUMN codigo VARCHAR(50) UNIQUE AFTER store_code');
    }
    
    if (!columnNames.includes('senha')) {
      console.log('➕ Adicionando coluna senha...');
      await connection.execute('ALTER TABLE stores ADD COLUMN senha VARCHAR(255) AFTER codigo');
    }
    
    // Atualizar dados existentes
    console.log('🔄 Atualizando dados existentes...');
    await connection.execute(`
      UPDATE stores SET 
      store_code = CONCAT('STORE', LPAD(id, 3, '0')),
      codigo = CONCAT('STORE', LPAD(id, 3, '0')),
      senha = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5QqQqQq'
      WHERE store_code IS NULL OR codigo IS NULL OR senha IS NULL
    `);
    
    // Verificar resultado
    const [stores] = await connection.execute('SELECT id, name, store_code, codigo FROM stores LIMIT 5');
    console.log('📋 Lojas atualizadas:', stores);
    
    await connection.end();
    console.log('✅ Estrutura do banco atualizada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco:', error.message);
    process.exit(1);
  }
}

updateDatabase(); 