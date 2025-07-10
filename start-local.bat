@echo off
echo 🚀 Iniciando servidor LOCAL...
echo 📋 Configuração: config-local.env
echo 🔧 Porta: 3001
echo.

set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=bella_store
set JWT_SECRET=segredo_local_bella_store_2024
set JWT_EXPIRES_IN=7d
set CLOUDINARY_CLOUD_NAME=seu_cloud_name
set CLOUDINARY_API_KEY=sua_api_key
set CLOUDINARY_API_SECRET=seu_api_secret
set PORT=3001
set NODE_ENV=local

node src/server.js 