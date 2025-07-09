import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'bella-mysql-2zfoqj',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bella_store',
  multipleStatements: true
};

async function testConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar se o banco existe
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📊 Bancos disponíveis:', databases.map(db => db.Database));
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n🔍 Verificando tabelas existentes...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas existentes:');
    
    if (tables.length === 0) {
      console.log('❌ Nenhuma tabela encontrada!');
      return false;
    }
    
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    return false;
  }
}

async function createTables() {
  console.log('\n🔧 Criando tabelas...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('banco_bella_store.sql', 'utf8');

    // Desabilita verificação de chave estrangeira temporariamente
    await connection.query('SET FOREIGN_KEY_CHECKS=0');

    // Quebra o arquivo em declarações individuais (pelo ponto-e-vírgula no final da linha)
    const statements = sqlContent
      // Remove comentários '--'
      .replace(/--[^\n]*\n/g, '\n')
      // Remove linhas vazias
      .split(/;\s*(?:\n|$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.query(statement);
      } catch (err) {
        console.error(`\n❌ ERRO NA INSTRUÇÃO #${i + 1}:`);
        console.error(`${statement.substring(0, 500)}\n--- fim do trecho ---`);
        console.error('Mensagem do MySQL:', err.message);
        throw err; // Re-lança para o catch externo
      }
    }

    // Reabilita verificação de chave estrangeira
    await connection.query('SET FOREIGN_KEY_CHECKS=1');

    console.log('✅ Tabelas criadas com sucesso!');

    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    return false;
  }
}

async function createInitialData() {
  console.log('\n🎯 Criando dados iniciais...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar se já existem dados
    const [stores] = await connection.execute('SELECT COUNT(*) as count FROM stores');
    const storeCount = stores[0].count;
    
    if (storeCount > 0) {
      console.log('ℹ️  Dados iniciais já existem. Pulando...');
      await connection.end();
      return true;
    }
    
    // Criar loja inicial
    const [storeResult] = await connection.execute(`
      INSERT INTO stores (name, description, whatsapp, email, endereco, isActive) 
      VALUES ('Bella Store', 'Loja de exemplo', '(11) 99999-9999', 'contato@bellastore.com', 'Rua Exemplo, 123', true)
    `);
    
    const storeId = storeResult.insertId;
    console.log('✅ Loja criada com ID:', storeId);
    
    // Criar usuário admin
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(`
      INSERT INTO users (name, email, senha, tipo, storeId) 
      VALUES ('Admin', 'admin@teste.com', ?, 'admin_master', ?)
    `, [hashedPassword, storeId]);
    
    console.log('✅ Usuário admin criado:');
    console.log('   📧 Email: admin@teste.com');
    console.log('   🔑 Senha: admin123');
    
    // Criar configurações da loja
    await connection.execute(`
      INSERT INTO settings (storeId, moeda, fuso_horario, plano, limite_produtos, limite_fotos_produto) 
      VALUES (?, 'BRL', 'America/Sao_Paulo', 'Pro', 1000, 5)
    `, [storeId]);
    
    console.log('✅ Configurações criadas!');
    
    // Criar categoria exemplo
    await connection.execute(`
      INSERT INTO categories (name, description, slug, storeId, isActive) 
      VALUES ('Eletrônicos', 'Categoria de produtos eletrônicos', 'eletronicos', ?, true)
    `, [storeId]);
    
    console.log('✅ Categoria exemplo criada!');
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando configuração do banco de dados...\n');
  
  // Teste de conexão
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Falha na conexão. Verifique suas configurações!');
    process.exit(1);
  }
  
  // Verificar tabelas
  const tablesExist = await checkTables();
  
  if (!tablesExist) {
    console.log('\n⚠️  Tabelas não encontradas. Criando...');
    const tablesCreated = await createTables();
    
    if (!tablesCreated) {
      console.log('\n❌ Falha ao criar tabelas!');
      process.exit(1);
    }
  }
  
  // Criar dados iniciais
  await createInitialData();
  
  console.log('\n🎉 Configuração concluída com sucesso!');
  console.log('\n📋 Resumo:');
  console.log('✅ Banco de dados: bella_store');
  console.log('✅ Tabelas: Criadas');
  console.log('✅ Dados iniciais: Configurados');
  console.log('✅ Usuário admin: admin@teste.com / admin123');
  console.log('\n🔗 Teste seu backend em: /health');
}

main().catch(console.error); 