import express from 'express';
import { testConnection } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Testar conexão com o banco
    const dbStatus = await testConnection();
    
    const healthCheck = {
      status: dbStatus ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'bella-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: {
        status: dbStatus ? 'connected' : 'disconnected',
        host: process.env.DB_HOST || 'localhost',
        name: process.env.DB_NAME || 'bella_store'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        unit: 'MB'
      },
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        stores: '/api/stores',
        categories: '/api/categories',
        orders: '/api/orders',
        banners: '/api/banners',
        upload: '/api/upload',
        dashboard: '/api/dashboard'
      }
    };

    // Retornar status 500 se o banco não estiver conectado
    const statusCode = dbStatus ? 200 : 500;
    res.status(statusCode).json(healthCheck);
    
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'bella-backend',
      error: error.message
    });
  }
});

export default router;