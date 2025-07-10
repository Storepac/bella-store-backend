# 🚀 Configuração Local - Sistema Bella Store

## 📋 Pré-requisitos

1. **XAMPP** instalado e rodando
2. **Node.js** versão 16 ou superior
3. **Git** para clonar o repositório

## 🗄️ Configuração do Banco de Dados

### 1. Criar banco de dados no phpMyAdmin

1. Abra o phpMyAdmin: http://localhost/phpmyadmin
2. Clique em "Novo" para criar um novo banco
3. Nome do banco: `bella_store`
4. Collation: `utf8mb4_unicode_ci`
5. Clique em "Criar"

### 2. Configurar o banco de dados

```bash
# Na pasta bella-store-backend
npm run setup-db
```

### 3. Criar usuário admin master

```bash
# Na pasta bella-store-backend
npm run create-admin-master
```

**Credenciais do admin master:**
- Email: `admin@admin`
- Senha: `123`

## 🔧 Configuração do Backend

### 1. Instalar dependências

```bash
cd bella-store-backend
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `config-local.env` já está configurado para XAMPP:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bella_store
JWT_SECRET=segredo_local_bella_store_2024
JWT_EXPIRES_IN=7d
PORT=3000
```

### 3. Iniciar o servidor

```bash
npm run dev
```

O backend estará rodando em: http://localhost:3000

## 🎨 Configuração do Frontend

### 1. Instalar dependências

```bash
cd model-bella-store
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `env.local` já está configurado para localhost:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_URL=http://localhost:3000
```

### 3. Iniciar o frontend

```bash
npm run dev
```

O frontend estará rodando em: http://localhost:3000

## 🔐 Acessos do Sistema

### Dashboard Admin Master
- **URL**: http://localhost:3000/admin
- **Email**: admin@admin
- **Senha**: 123

### Dashboard Loja
- **URL**: http://localhost:3000/dashboard
- **Código da loja**: (criado pelo admin master)
- **Senha**: (definida pelo admin master)

## 📱 Funcionalidades Disponíveis

### Admin Master
- ✅ Criar novas lojas
- ✅ Gerenciar usuários
- ✅ Visualizar estatísticas do sistema
- ✅ Configurar planos e limites

### Admin Loja
- ✅ Gerenciar produtos
- ✅ Gerenciar categorias
- ✅ Gerenciar banners
- ✅ Gerenciar cupons
- ✅ Visualizar pedidos
- ✅ Configurar aparência da loja

## 🐛 Solução de Problemas

### Erro de conexão com banco
- Verifique se o XAMPP está rodando
- Confirme se o banco `bella_store` existe
- Verifique as credenciais no `config-local.env`

### Erro de CORS
- O backend já está configurado para aceitar localhost:3000
- Verifique se as URLs estão corretas no `env.local`

### Erro de autenticação
- Execute novamente: `npm run create-admin-master`
- Verifique se o JWT_SECRET está configurado

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do console do navegador
2. Logs do terminal do backend
3. Logs do terminal do frontend
4. Status do XAMPP e MySQL 