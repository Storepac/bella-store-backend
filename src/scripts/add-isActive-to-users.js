import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const addIsActiveColumn = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔍 Verificando se a coluna isActive existe na tabela users...');
    
    // Verificar se a coluna já existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'isActive'
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('✅ Coluna isActive já existe na tabela users');
      return;
    }

    console.log('➕ Adicionando coluna isActive na tabela users...');
    
    // Adicionar a coluna isActive
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE
    `);

    console.log('✅ Coluna isActive adicionada com sucesso!');
    
    // Atualizar registros existentes para ter isActive = true
    await connection.execute(`
      UPDATE users SET isActive = TRUE WHERE isActive IS NULL
    `);
    
    console.log('✅ Registros existentes atualizados com isActive = TRUE');

  } catch (error) {
    console.error('❌ Erro ao adicionar coluna isActive:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

// Executar o script
addIsActiveColumn()
  .then(() => {
    console.log('🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro na execução do script:', error);
    process.exit(1);
  }); 