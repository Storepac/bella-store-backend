import fs from 'fs';
import path from 'path';

console.log('🔄 Trocando para configuração LOCAL...');

// Ler configuração local
const localConfig = fs.readFileSync('config-local.env', 'utf8');

// Criar .env com configuração local
fs.writeFileSync('.env', localConfig);

console.log('✅ Configuração local aplicada!');
console.log('📋 Configurações:');
console.log('   - Host: localhost');
console.log('   - Porta: 3306');
console.log('   - Usuário: root');
console.log('   - Senha: (vazia)');
console.log('   - Banco: bella_store');
console.log('');
console.log('🚀 Para usar, execute: npm start');
console.log('📝 Certifique-se de que o XAMPP está rodando!'); 