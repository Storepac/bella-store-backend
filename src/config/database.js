import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'bella_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Evento de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados MySQL');
});

// Evento de erro
pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco de dados:', err);
  process.exit(-1);
});

// Função para executar queries
export const query = async (sql, params) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// Função para transações
export const transaction = async (callback) => {
  const client = await pool.getConnection();
  try {
    await client.beginTransaction();
    const result = await callback(client);
    await client.commit();
    return result;
  } catch (error) {
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
};

// Função para testar conexão
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Teste de conexão bem-sucedido:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão:', error);
    return false;
  }
};

export default pool;