import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'bella-mysql-2zfoqj',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gzsexpaiz33cirzeorjk2iuhzawiq1na',
  database: process.env.DB_NAME || 'bella_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

export const pool = mysql.createPool(dbConfig);

// Evento de conexão
pool.on('connection', (connection) => {
  console.log('✅ Nova conexão estabelecida com o banco de dados MySQL');
});

// Evento de erro
pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco de dados:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Tentando reconectar...');
  } else {
    throw err;
  }
});

// Função para executar queries com retry
export const query = async (sql, params = []) => {
  let retries = 3;
  while (retries > 0) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      retries--;
      console.error(`❌ Erro na query (tentativas restantes: ${retries}):`, error.message);
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Função para transações
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Função para testar conexão
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Teste de conexão bem-sucedido:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão:', error.message);
    return false;
  }
};

// Testar conexão ao inicializar
testConnection();

export default pool;