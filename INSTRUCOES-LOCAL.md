# 🏠 Configuração Local - XAMPP

## ✅ O que foi feito:

1. **Removidos todos os arquivos de teste** que foram criados durante o desenvolvimento
2. **Renomeado** `src/config/database.js` para `src/config/database-remote.js` (configuração remota)
3. **Criado** novo `src/config/database.js` para conexão local com XAMPP
4. **Criados scripts** para trocar entre configurações:
   - `switch-to-local.js` - Para usar XAMPP
   - `switch-to-remote.js` - Para voltar ao servidor remoto

## 🚀 Como usar agora:

### 1. Configure o XAMPP:
- Inicie o XAMPP Control Panel
- Inicie o **Apache** e **MySQL**
- Acesse o phpMyAdmin: `http://localhost/phpmyadmin`

### 2. Crie o banco de dados:
- No phpMyAdmin, clique em "Novo"
- Nome do banco: `bella_store`
- Clique em "Criar"

### 3. Importe o banco:
- Selecione o banco `bella_store`
- Vá na aba "Importar"
- Escolha o arquivo `banco_bella_store.sql`
- Clique em "Executar"

### 4. Configure o backend:
```bash
# Aplicar configuração local (já foi feito)
node switch-to-local.js

# Iniciar o servidor
npm start
```

## 🔄 Para trocar de configuração:

### Para Local (XAMPP):
```bash
node switch-to-local.js
```

### Para Remoto:
```bash
node switch-to-remote.js
```

## 📋 Configurações atuais:

### Local (XAMPP):
- Host: `localhost`
- Porta: `3306`
- Usuário: `root`
- Senha: `(vazia)`
- Banco: `bella_store`

### Remoto:
- Host: `bella-mysql-2zfoqj`
- Porta: `3306`
- Usuário: `root`
- Senha: `gzsexpaiz33cirzeorjk2iuhzawiq1na`
- Banco: `bella_store`

## 🧪 Teste o sistema:

1. **Inicie o servidor**: `npm start`
2. **Acesse**: `http://localhost:3000/api/health`
3. **Teste login**: 
   - Email: `admin@teste.com`
   - Senha: `123`

## 📁 Arquivos importantes:

- `src/config/database.js` - Configuração atual (local)
- `src/config/database-remote.js` - Configuração remota (guardada)
- `config-local.env` - Variáveis de ambiente local
- `switch-to-local.js` - Script para trocar para local
- `switch-to-remote.js` - Script para trocar para remoto

## ⚠️ Lembre-se:

- Sempre inicie o XAMPP antes de rodar o backend
- Para voltar ao servidor remoto, use `node switch-to-remote.js`
- As configurações do Cloudinary precisam ser ajustadas no arquivo `.env` 