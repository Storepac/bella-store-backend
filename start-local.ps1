Write-Host "🚀 Iniciando servidor LOCAL..." -ForegroundColor Green
Write-Host "📋 Configuração: config-local.env" -ForegroundColor Yellow
Write-Host "🔧 Porta: 3001" -ForegroundColor Cyan
Write-Host ""

$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_USER = "root"
$env:DB_PASSWORD = ""
$env:DB_NAME = "bella_store"
$env:JWT_SECRET = "segredo_local_bella_store_2024"
$env:JWT_EXPIRES_IN = "7d"
$env:CLOUDINARY_CLOUD_NAME = "seu_cloud_name"
$env:CLOUDINARY_API_KEY = "sua_api_key"
$env:CLOUDINARY_API_SECRET = "seu_api_secret"
$env:PORT = "3001"
$env:NODE_ENV = "local"

node src/server.js 