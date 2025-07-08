import express from 'express';
import { testConnection } from '../config/database.js';

const router = express.Router();

// GET /api/health - Health check
router.get('/', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bella-store-backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbConnected ? 'connected' : 'disconnected'
    };
    
    res.status(dbConnected ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'bella-store-backend',
      error: error.message
    });
  }
});

export default router; 