# 🚀 Configuração do Next.js para Conectar com o Backend

## 1. Criar arquivo .env.local na raiz do projeto Next.js

```env
# .env.local (na raiz do projeto Next.js)
NEXT_PUBLIC_API_URL=https://SUA-URL-BACKEND.dokploy.com/api
NEXT_PUBLIC_BACKEND_URL=https://SUA-URL-BACKEND.dokploy.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## 2. Criar arquivo lib/api.js (ou src/lib/api.js)

```javascript
// lib/api.js
import axios from 'axios';

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const api = axios.create(API_CONFIG);

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Serviços
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      return { success: true, token, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro no login' 
      };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export const productService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  }
};
```

## 3. Exemplo de componente de Login

```javascript
// pages/login.js ou app/login/page.js
import { useState } from 'react';
import { authService } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await authService.login(email, password);
    
    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

## 4. Hook personalizado para autenticação

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, isAuthenticated: !!user };
};
```

## 5. Configuração Next.js (next.config.js)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
      },
    ];
  },
  images: {
    domains: ['res.cloudinary.com', 'sua-url-backend.dokploy.com'],
  },
};

module.exports = nextConfig;
```

## 6. Middleware para páginas protegidas

```javascript
// middleware.js (na raiz do projeto Next.js 13+)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*'
};
```

## 🔧 Instalação de dependências

```bash
npm install axios
# ou
yarn add axios
```

## 📝 Dados de teste para o login

Depois de executar o script `setup-database.js`, você pode fazer login com:

- **Email**: `admin@teste.com`
- **Senha**: `admin123` 