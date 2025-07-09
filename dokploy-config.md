# Configuração do Backend no Dokploy

## 1. Variáveis de Ambiente

Configure estas variáveis no painel do Dokploy:

```env
# Banco de Dados
DB_HOST=bella-mysql-2zfoqj
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_root
DB_NAME=bella_store

# Servidor
PORT=3001
NODE_ENV=production

# Segurança
JWT_SECRET=sua_chave_jwt_super_segura_aqui_123456789

# CORS (ajuste conforme seu frontend)
CORS_ORIGINS=https://seu-frontend.dokploy.com,https://seu-dominio.com
```

## 2. Configuração do Dokploy

### Build Settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: 3001

### Health Check:
- **Health Check URL**: `/health`
- **Health Check Interval**: 30s

## 3. Configuração do Banco MySQL

Certifique-se de que o banco MySQL está rodando e acessível:
- Host interno: `bella-mysql-2zfoqj`
- Porta: 3306
- Database: `bella_store`

## 4. URLs do Backend

Após o deploy, sua API estará disponível em:
- Health Check: `https://seu-backend.dokploy.com/health`
- API Base: `https://seu-backend.dokploy.com/api`

## 5. Endpoints Disponíveis

- `GET /health` - Status do servidor
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/products` - Listar produtos
- `GET /api/stores` - Listar lojas
- `GET /api/categories` - Listar categorias
- `POST /api/orders` - Criar pedido
- `GET /api/banners` - Listar banners
- `POST /api/upload` - Upload de arquivos
- `GET /api/dashboard` - Dashboard

## 6. Configuração do Frontend

No seu frontend, use a URL do backend no Dokploy:

```javascript
const API_BASE_URL = 'https://seu-backend.dokploy.com/api';
``` 