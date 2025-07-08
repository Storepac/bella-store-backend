import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Middleware de autenticação
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
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
      message: 'Token inválido'
    });
  }
};