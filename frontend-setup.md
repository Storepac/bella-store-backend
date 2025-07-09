# 🚀 Configuração do Frontend - Guia Completo

## 1. Primeiro: Encontre a URL correta do Backend

No painel do Dokploy, procure a URL real do seu backend. Será algo como:
- `https://bella-store-backend.dokploy.com`
- `https://seu-usuario-backend.dokploy.com`

## 2. Configuração por Framework

### 📘 **React**

Crie um arquivo `.env` na raiz do projeto:

```env
# .env
REACT_APP_API_URL=https://sua-url-backend.dokploy.com/api
REACT_APP_ENVIRONMENT=production
```

**Arquivo de configuração (config.js):**
```javascript
// config.js
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development'
};

export default config;
```

**Uso em componentes:**
```javascript
// services/api.js
import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
```

### 📗 **Next.js**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://sua-url-backend.dokploy.com/api
NEXT_PUBLIC_ENVIRONMENT=production
```

**Arquivo de configuração:**
```javascript
// lib/config.js
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
};
```

### 📙 **Vue.js**

Crie um arquivo `.env` na raiz do projeto:

```env
# .env
VUE_APP_API_URL=https://sua-url-backend.dokploy.com/api
VUE_APP_ENVIRONMENT=production
```

**Arquivo de configuração:**
```javascript
// config.js
const config = {
  apiUrl: process.env.VUE_APP_API_URL || 'http://localhost:3001/api',
  environment: process.env.VUE_APP_ENVIRONMENT || 'development'
};

export default config;
```

### 📕 **Angular**

Edite o arquivo `src/environments/environment.prod.ts`:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://sua-url-backend.dokploy.com/api'
};
```

## 3. Configuração Universal (JavaScript Puro)

Se não usar framework, crie um arquivo `config.js`:

```javascript
// config.js
const getApiUrl = () => {
  // Em desenvolvimento
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  }
  
  // Em produção
  return 'https://sua-url-backend.dokploy.com/api';
};

window.APP_CONFIG = {
  apiUrl: getApiUrl(),
  environment: 'production'
};
```

## 4. Testando a Configuração

**Criar um arquivo de teste:**
```javascript
// test-connection.js
const API_URL = 'https://sua-url-backend.dokploy.com/api';

async function testConnection() {
  try {
    // Teste do health check
    const healthResponse = await fetch(`${API_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Health Check:', healthData);
    
    // Teste de endpoint da API
    const apiResponse = await fetch(`${API_URL}/health`);
    if (apiResponse.ok) {
      console.log('✅ API está funcionando');
    } else {
      console.log('❌ API não está respondendo');
    }
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
  }
}

// Executar teste
testConnection();
```

## 5. Exemplo de Serviço de API

```javascript
// services/apiService.js
const API_URL = 'https://sua-url-backend.dokploy.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Adicionar token se disponível
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Métodos específicos
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getProducts() {
    return this.request('/products');
  }

  async getStores() {
    return this.request('/stores');
  }
}

export default new ApiService();
```

## 6. Configuração para Deploy

### **Dokploy (Frontend)**

Se seu frontend também está no Dokploy, configure as variáveis de ambiente:

```env
# No painel do Dokploy - Frontend
REACT_APP_API_URL=https://sua-url-backend.dokploy.com/api
NEXT_PUBLIC_API_URL=https://sua-url-backend.dokploy.com/api
VUE_APP_API_URL=https://sua-url-backend.dokploy.com/api
```

### **Vercel/Netlify**

Configure as variáveis de ambiente no painel:

```env
REACT_APP_API_URL=https://sua-url-backend.dokploy.com/api
NEXT_PUBLIC_API_URL=https://sua-url-backend.dokploy.com/api
```

## 7. Checklist de Configuração

- [ ] Encontrou a URL correta do backend
- [ ] Testou o health check (`/health`)
- [ ] Configurou as variáveis de ambiente
- [ ] Criou o serviço de API
- [ ] Testou a conexão
- [ ] Configurou autenticação
- [ ] Atualizou o CORS no backend

## 8. Próximos Passos

1. **Encontre a URL correta** do backend no Dokploy
2. **Substitua** `https://sua-url-backend.dokploy.com` pela URL real
3. **Teste** o health check
4. **Configure** as variáveis de ambiente
5. **Implemente** os serviços de API
6. **Teste** a conexão completa

🎯 **Dica**: Use sempre HTTPS em produção, não HTTP! 