import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Middleware de autenticação
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');
    
    // Buscar usuário no banco
    const userResult = await query(
      'SELECT * FROM users WHERE id = ? AND isActive = true',
      [decoded.userId]
    );

    if (userResult.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    req.user = userResult[0];
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

// Middleware para verificar se é admin master
export const requireAdminMaster = async (req, res, next) => {
  if (req.user.tipo !== 'admin_master') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas admin master pode acessar esta rota.'
    });
  }
  next();
};

// Middleware para verificar se é admin da loja
export const requireStoreAdmin = async (req, res, next) => {
  if (req.user.tipo !== 'admin_loja' && req.user.tipo !== 'admin_master') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar esta rota.'
    });
  }
  next();
};