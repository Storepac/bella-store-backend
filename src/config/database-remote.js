import dotenv from 'dotenv';

dotenv.config();

const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST || 'bella-mysql-2zfoqj',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'wgmtkfzxykh1gaygjejytl1dmt4qthy0',
  database: process.env.DB_NAME || 'bella_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
}

const pool = mysql.createPool(dbConfig)

// Teste de conexão inicial
pool.getConnection()
  .then(connection => {
    connection.release()
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com o banco de dados remoto:', err.message)
  })

// Tratamento de erros de conexão
pool.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('❌ Conexão com o banco de dados perdida')
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('❌ Banco de dados tem muitas conexões')
  } else if (err.code === 'ECONNREFUSED') {
    console.error('❌ Conexão com o banco de dados recusada')
  } else {
    console.error('❌ Erro no banco de dados:', err)
  }
})

// Função para testar a conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    const [result] = await connection.execute('SELECT 1 as test')
    connection.release()
    return result[0]
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error.message)
    throw error
  }
}

module.exports = {
  pool,
  testConnection
}