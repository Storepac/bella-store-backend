import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'bella-mysql-2zfoqj',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gzsexpaiz33cirzeorjk2iuhzawiq1na',
  database: process.env.DB_NAME || 'bella_store'
};

async function checkAdmin() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Verificando usuário admin...');
    
    const [users] = await connection.execute('SELECT id, name, email, tipo FROM users WHERE email = ?', ['admin@admin']);
    console.log('📋 Usuários encontrados:', users);
    
    if (users.length === 0) {
      console.log('❌ Usuário admin@admin não encontrado!');
      console.log('🔄 Criando usuário admin...');
      
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('123', 12);
      
      await connection.execute(`
        INSERT INTO users (name, email, senha, tipo) 
        VALUES (?, ?, ?, ?)
      `, ['Admin Master', 'admin@admin', hashedPassword, 'admin_master']);
      
      console.log('✅ Usuário admin criado!');
    } else {
      console.log('✅ Usuário admin encontrado:', users[0]);
    }
    
    // Verificar todos os usuários
    const [allUsers] = await connection.execute('SELECT id, name, email, tipo FROM users');
    console.log('\n📋 Todos os usuários:', allUsers);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkAdmin(); 