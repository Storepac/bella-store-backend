import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function addIsActiveColumn() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    // Verifica se a coluna já existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'isActive'
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('✅ A coluna isActive já existe na tabela users.');
      await connection.end();
      return;
    }

    // Adiciona a coluna
    await connection.execute(`
      ALTER TABLE users ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE;
    `);
    console.log('✅ Coluna isActive adicionada com sucesso na tabela users!');
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna isActive:', error.message);
  } finally {
    await connection.end();
  }
}

addIsActiveColumn(); 