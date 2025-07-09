# 🌐 Configuração do Frontend para Conectar com o Backend

## 📡 URL Base da API

```javascript
const API_BASE_URL = 'http://bella-frontend-ze7wni-da10f0-152-53-192-161.traefik.me/api';
```

## 🔧 Configuração do Axios (Recomendado)

```javascript
// api.js
import axios from 'axios';

const API_BASE_URL = 'http://bella-frontend-ze7wni-da10f0-152-53-192-161.traefik.me/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 🔐 Serviços de Autenticação

```javascript
// services/authService.js
import api from '../api';

export const authService = {
  // Login Admin Master
  async loginAdmin(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, token };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro no login' 
      };
    }
  },

  // Login Lojista
  async loginLojista(codigo, password) {
    try {
      const response = await api.post('/auth/login', {
        codigo,
        password
      });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user, token };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro no login' 
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obter token
  getToken() {
    return localStorage.getItem('token');
  }
};
```

## 🛍️ Serviços de Produtos

```javascript
// services/productService.js
import api from '../api';

export const productService = {
  // Listar produtos
  async getProducts(storeId = null) {
    try {
      const url = storeId ? `/products?storeId=${storeId}` : '/products';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar produtos');
    }
  },

  // Buscar produto por ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar produto');
    }
  },

  // Criar produto
  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao criar produto');
    }
  },

  // Atualizar produto
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar produto');
    }
  },

  // Deletar produto
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao deletar produto');
    }
  }
};
```

## 🏪 Serviços de Lojas

```javascript
// services/storeService.js
import api from '../api';

export const storeService = {
  // Listar lojas
  async getStores() {
    try {
      const response = await api.get('/stores');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar lojas');
    }
  },

  // Buscar loja por ID
  async getStoreById(id) {
    try {
      const response = await api.get(`/stores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar loja');
    }
  },

  // Criar loja
  async createStore(storeData) {
    try {
      const response = await api.post('/stores', storeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao criar loja');
    }
  },

  // Atualizar loja
  async updateStore(id, storeData) {
    try {
      const response = await api.put(`/stores/${id}`, storeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar loja');
    }
  }
};
```

## 📦 Serviços de Pedidos

```javascript
// services/orderService.js
import api from '../api';

export const orderService = {
  // Listar pedidos
  async getOrders(storeId = null) {
    try {
      const url = storeId ? `/orders?storeId=${storeId}` : '/orders';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar pedidos');
    }
  },

  // Buscar pedido por ID
  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar pedido');
    }
  },

  // Criar pedido
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao criar pedido');
    }
  },

  // Atualizar status do pedido
  async updateOrderStatus(id, status) {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar pedido');
    }
  }
};
```

## 📤 Serviços de Upload

```javascript
// services/uploadService.js
import api from '../api';

export const uploadService = {
  // Upload de imagem
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro no upload');
    }
  }
};
```

## 🔒 Componente de Proteção de Rotas

```javascript
// components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.tipo !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

## 🌍 Context para Estado Global

```javascript
// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    const userData = authService.getCurrentUser();
    
    if (token && userData) {
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authService.loginAdmin(credentials.email, credentials.password);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Erro no login' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🎯 Exemplo de Uso em Componente

```javascript
// components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLojista, setIsLojista] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(credentials);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Erro no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type={isLojista ? 'text' : 'email'}
        placeholder={isLojista ? 'Código da loja' : 'Email'}
        value={isLojista ? credentials.codigo : credentials.email}
        onChange={(e) => setCredentials({
          ...credentials,
          [isLojista ? 'codigo' : 'email']: e.target.value
        })}
        required
      />
      
      <input
        type="password"
        placeholder="Senha"
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials,
          password: e.target.value
        })}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      
      <button type="button" onClick={() => setIsLojista(!isLojista)}>
        {isLojista ? 'Login como Admin' : 'Login como Lojista'}
      </button>
    </form>
  );
};

export default Login;
```

## 🚀 Próximos Passos

1. **Instale as dependências no frontend:**
   ```bash
   npm install axios react-router-dom
   ```

2. **Configure as variáveis de ambiente:**
   ```env
   REACT_APP_API_URL=http://bella-frontend-ze7wni-da10f0-152-53-192-161.traefik.me/api
   ```

3. **Teste a conexão:**
   - Use o arquivo `test-api.js` para verificar se a API está funcionando
   - Implemente os serviços gradualmente

4. **Endpoints principais disponíveis:**
   - `POST /api/auth/login` - Login
   - `GET /api/products` - Produtos
   - `GET /api/stores` - Lojas
   - `GET /api/categories` - Categorias
   - `POST /api/orders` - Pedidos
   - `POST /api/upload` - Upload

Seu backend está pronto e funcionando! 🎉 