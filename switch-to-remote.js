import fs from 'fs';
import path from 'path';

console.log('🔄 Trocando para configuração REMOTA...');

// Configuração remota (você pode ajustar conforme necessário)
const remoteConfig = `# Configuração Remota
DB_HOST=bella-mysql-2zfoqj
DB_PORT=3306
DB_USER=root
DB_PASSWORD=gzsexpaiz33cirzeorjk2iuhzawiq1na
DB_NAME=bella_store

# JWT
JWT_SECRET=segredo_remoto_bella_store_2024
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Porta do servidor
PORT=3000`;

// Criar .env com configuração remota
fs.writeFileSync('.env', remoteConfig);

console.log('✅ Configuração remota aplicada!');
console.log('📋 Configurações:');
console.log('   - Host: bella-mysql-2zfoqj');
console.log('   - Porta: 3306');
console.log('   - Usuário: root');
console.log('   - Banco: bella_store');
console.log('');
console.log('🚀 Para usar, execute: npm start'); 