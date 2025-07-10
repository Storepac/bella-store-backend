import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando servidor LOCAL...');
console.log('📋 Configuração: config-local.env');
console.log('🔧 Porta: 3001');
console.log('');

// Iniciar o servidor com as variáveis de ambiente do arquivo local
const child = spawn('node', ['src/server.js'], {
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'local',
    PORT: '3001'
  },
  stdio: 'inherit'
});

child.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
});

child.on('close', (code) => {
  console.log(`\n🔄 Servidor encerrado com código: ${code}`);
}); 