import { query } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🗄️  Configurando banco de dados...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '../banco_bella_store.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await query(command);
          console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
        } catch (error) {
          // Ignorar erros de tabela já existente
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log(`⚠️  Tabela já existe (comando ${i + 1})`);
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Execute: npm run create-admin-master');
    console.log('2. Execute: npm run dev');
    console.log('3. Acesse: http://localhost:3000/admin');
    console.log('4. Login: admin@admin / 123');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  }
}

// Executar o script
setupDatabase().then(() => {
  console.log('🏁 Script finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
}); 