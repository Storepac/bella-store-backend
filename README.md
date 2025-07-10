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
- MySQL 8.0+ (XAMPP ou servidor remoto)
- Conta no Cloudinary (opcional)

## 🔧 Configuração

### 🏠 Configuração Local (XAMPP)

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure para uso local**
   ```bash
   node switch-to-local.js
   ```

3. **Configure o XAMPP**
   - Inicie o Apache e MySQL no XAMPP
   - Crie o banco `bella_store` no phpMyAdmin
   - Importe o arquivo `banco_bella_store.sql`

4. **Inicie o servidor**
   ```bash
   npm start
   ```

### 🌐 Configuração Remota

1. **Configure para uso remoto**
   ```bash
   node switch-to-remote.js
   ```

2. **Inicie o servidor**
   ```bash
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
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "123"
  }'
```

### Criar Produto
```bash
curl -X POST http://localhost:3000/api/products \
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

## 🔄 Troca de Configuração

### Para Local (XAMPP)
```bash
node switch-to-local.js
```

### Para Remoto
```bash
node switch-to-remote.js
```

## 📊 Monitoramento

- **Health Check**: `GET /api/health`
- **Logs**: Morgan em desenvolvimento
- **Rate Limiting**: 100 requests/15min por IP

## 🔧 Scripts Disponíveis

- `npm run dev` - Desenvolvimento com nodemon
- `npm start` - Produção
- `npm test` - Executar testes

## 📄 Licença

MIT License 