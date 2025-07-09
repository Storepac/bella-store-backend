# Bella Store Backend

Backend para sistema de e-commerce multi-loja com integração WhatsApp.

## 🚀 Tecnologias

- **Node.js** com ES Modules
- **Express.js** para API REST
- **MySQL** com mysql2
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Multer** para upload de arquivos
- **Sharp** para processamento de imagens
- **Cloudinary** para armazenamento de mídia

## 📋 Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- Conta no Cloudinary (opcional)

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd bella-store-backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o `.env` com suas configurações:
   ```env
   # Database
   DB_HOST=bella-mysql-2zfoqj
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha_aqui
   DB_NAME=bella_store
   
   # JWT
   JWT_SECRET=seu_jwt_secret_aqui
   JWT_EXPIRES_IN=7d
   
   # Server
   PORT=3001
   NODE_ENV=production
   
   # CORS
   CORS_ORIGINS=http://localhost:3000,https://seu-frontend.com
   
   # Cloudinary (opcional)
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=sua_api_secret
   ```

4. **Configure o banco de dados**
   ```bash
   npm run setup-db
   ```

5. **Inicie o servidor**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 🗄️ Estrutura do Banco

O sistema inclui as seguintes tabelas principais:

- **stores** - Lojas/estabelecimentos
- **users** - Usuários (admin_master, admin_loja)
- **products** - Produtos
- **categories** - Categorias
- **orders** - Pedidos
- **clients** - Clientes
- **banners** - Banners promocionais
- **settings** - Configurações por loja
- **appearance** - Personalização visual

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Dados do usuário logado

### Lojas
- `GET /api/stores` - Listar lojas
- `POST /api/stores` - Criar loja
- `GET /api/stores/:id` - Detalhes da loja
- `PUT /api/stores/:id` - Atualizar loja

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Detalhes do produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `GET /api/categories/:id` - Detalhes da categoria
- `PUT /api/categories/:id` - Atualizar categoria

### Banners
- `GET /api/banners` - Listar banners
- `POST /api/banners` - Criar banner
- `PUT /api/banners/:id` - Atualizar banner

### Upload
- `POST /api/upload` - Upload de arquivos

### Health Check
- `GET /api/health` - Status da API

## 🔐 Autenticação

O sistema usa JWT para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## 📝 Exemplo de Uso

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "admin123"
  }'
```

### Criar Produto
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Teste",
    "price": 99.99,
    "description": "Descrição do produto",
    "categoryId": 1,
    "storeId": 1
  }'
```

## 🐳 Docker

Para executar com Docker:

```bash
# Build da imagem
docker build -t bella-store-backend .

# Executar container
docker run -p 3001:3001 --env-file .env bella-store-backend
```

## 📊 Monitoramento

- **Health Check**: `GET /api/health`
- **Logs**: Morgan em desenvolvimento
- **Rate Limiting**: 100 requests/15min por IP

## 🔧 Scripts Disponíveis

- `npm run dev` - Desenvolvimento com nodemon
- `npm start` - Produção
- `npm run setup-db` - Configurar banco de dados
- `npm test` - Executar testes

## 📄 Licença

MIT License 