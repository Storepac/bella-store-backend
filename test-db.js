import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Variáveis de ambiente:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.substring(0, 10) + '...' : 'não definida');

async function testConnection() {
  try {
    console.log('\n🔗 Tentando conectar ao banco...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'bella-mysql-2zfoqj',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'gzsexpaiz33cirzeorjk2iuhzawiq1na',
      database: process.env.DB_NAME || 'bella_store'
    });

    console.log('✅ Conexão estabelecida com sucesso!');
    
    const [result] = await connection.execute('SELECT NOW() as time');
    console.log('⏰ Hora do banco:', result[0].time);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas encontradas:', tables.length);
    
    await connection.end();
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Código do erro:', error.code);
  }
}

testConnection(); 