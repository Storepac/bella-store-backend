import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'bella-mysql-2zfoqj',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gzsexpaiz33cirzeorjk2iuhzawiq1na',
  database: process.env.DB_NAME || 'bella_store'
};

async function createAdminUser() {
  console.log('🔧 Criando usuário admin master...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar se o usuário já existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@admin']
    );
    
    if (existingUser.length > 0) {
      console.log('⚠️  Usuário admin@admin já existe!');
      console.log('🔄 Atualizando senha...');
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash('123', 12);
      
      // Atualizar senha
      await connection.execute(
        'UPDATE users SET senha = ? WHERE email = ?',
        [hashedPassword, 'admin@admin']
      );
      
      console.log('✅ Senha do usuário admin@admin atualizada!');
    } else {
      console.log('🆕 Criando novo usuário admin master...');
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash('123', 12);
      
      // Criar usuário admin master
      await connection.execute(`
        INSERT INTO users (name, email, senha, tipo) 
        VALUES (?, ?, ?, ?)
      `, ['Admin Master', 'admin@admin', hashedPassword, 'admin_master']);
      
      console.log('✅ Usuário admin master criado com sucesso!');
    }
    
    // Verificar se foi criado/atualizado
    const [user] = await connection.execute(
      'SELECT id, name, email, tipo FROM users WHERE email = ?',
      ['admin@admin']
    );
    
    if (user.length > 0) {
      console.log('\n📋 Dados do usuário:');
      console.log('   ID:', user[0].id);
      console.log('   Nome:', user[0].name);
      console.log('   Email:', user[0].email);
      console.log('   Tipo:', user[0].tipo);
      console.log('   Senha: 123');
    }
    
    await connection.end();
    
    console.log('\n🎉 Usuário admin master configurado!');
    console.log('🔗 Teste o login em: /api/auth/login');
    console.log('📧 Email: admin@admin');
    console.log('🔑 Senha: 123');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
    process.exit(1);
  }
}

createAdminUser(); 