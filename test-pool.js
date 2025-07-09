import { pool, testConnection } from './src/config/database.js';

console.log('🔍 Testando pool de conexões...');

async function testPool() {
  try {
    console.log('1️⃣ Testando função testConnection...');
    const result1 = await testConnection();
    console.log('Resultado testConnection:', result1);
    
    console.log('\n2️⃣ Testando pool diretamente...');
    const [rows] = await pool.execute('SELECT NOW() as time');
    console.log('Pool funcionou:', rows[0]);
    
    console.log('\n3️⃣ Testando query helper...');
    const { query } = await import('./src/config/database.js');
    const result2 = await query('SELECT COUNT(*) as count FROM users');
    console.log('Query helper funcionou:', result2);
    
    console.log('\n✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste do pool:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testPool(); 