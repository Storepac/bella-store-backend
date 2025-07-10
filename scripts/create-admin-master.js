import bcrypt from 'bcryptjs';
import { query } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminMaster() {
  try {
    console.log('🔧 Criando usuário admin master...');
    
    // Verificar se já existe um admin master
    const existingAdmin = await query(
      'SELECT id FROM users WHERE tipo = ?',
      ['admin_master']
    );
    
    if (existingAdmin.length > 0) {
      console.log('⚠️  Usuário admin master já existe!');
      console.log('📋 Usuários admin master encontrados:');
      existingAdmin.forEach(admin => {
        console.log(`   - ID: ${admin.id}`);
      });
      return;
    }
    
    // Dados do admin master
    const adminData = {
      name: 'Administrador Master',
      email: 'admin@admin',
      password: '123',
      tipo: 'admin_master'
    };
    
    // Hash da senha
    const senha = await bcrypt.hash(adminData.password, 12);
    
    // Inserir usuário admin master
    const result = await query(`
      INSERT INTO users (name, email, senha, tipo, isActive) 
      VALUES (?, ?, ?, ?, true)
    `, [adminData.name, adminData.email, senha, adminData.tipo]);
    
    console.log('✅ Usuário admin master criado com sucesso!');
    console.log('📋 Credenciais de acesso:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Senha: ${adminData.password}`);
    console.log(`   ID do usuário: ${result.insertId}`);
    console.log('');
    console.log('🔗 Acesse o dashboard admin em: http://localhost:3000/admin');
    console.log('📝 Use essas credenciais para fazer login');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin master:', error);
    process.exit(1);
  }
}

// Executar o script
createAdminMaster().then(() => {
  console.log('🏁 Script finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
}); 