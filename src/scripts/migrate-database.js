import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateDatabase() {
  console.log('🚀 Iniciando migração do banco de dados...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Criar banco se não existir
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'bella_store'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'bella_store'}`);
    
    console.log('✅ Banco de dados criado/selecionado');

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, '../../banco_bella_store.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar SQL
    console.log('📝 Executando script SQL...');
    await connection.query(sql);
    
    console.log('✅ Estrutura do banco criada com sucesso!');
    
    // Criar usuário admin master padrão se não existir
    const [adminExists] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@bella.com']
    );
    
    if (adminExists.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('admin123', 12);
      
      await connection.query(
        'INSERT INTO users (name, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Admin Master', 'admin@bella.com', hash, 'admin_master']
      );
      
      console.log('✅ Usuário admin master criado!');
      console.log('📧 Email: admin@bella.com');
      console.log('🔑 Senha: admin123');
    }
    
    // Criar loja de exemplo se não existir
    const [storeExists] = await connection.query(
      'SELECT id FROM stores WHERE store_code = ?',
      ['demo']
    );
    
    if (storeExists.length === 0) {
      const bcrypt = await import('bcryptjs');
      const storeHash = await bcrypt.hash('demo123', 12);
      
      const [storeResult] = await connection.query(
        `INSERT INTO stores (store_code, codigo, senha, name, description, cnpj, email, whatsapp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['demo', 'demo', storeHash, 'Loja Demo', 'Loja de demonstração', '00.000.000/0000-00', 'demo@bella.com', '11999999999']
      );
      
      const storeId = storeResult.insertId;
      
      // Criar settings da loja
      await connection.query(
        'INSERT INTO settings (storeId, plano, limite_produtos, limite_fotos_produto) VALUES (?, ?, ?, ?)',
        [storeId, 'Start', 500, 2]
      );
      
      // Criar aparência padrão
      await connection.query(
        'INSERT INTO appearance (storeId, cor_primaria, cor_secundaria, cor_botoes) VALUES (?, ?, ?, ?)',
        [storeId, '#000000', '#666666', '#000000']
      );
      
      console.log('✅ Loja demo criada!');
      console.log('🏪 Código: demo');
      console.log('🔑 Senha: demo123');
    }
    
    console.log('\n✨ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Executar migração
migrateDatabase().catch(console.error); 