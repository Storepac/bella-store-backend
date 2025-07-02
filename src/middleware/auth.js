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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar se é admin master
export const requireAdminMaster = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin_master') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas Admin Master pode acessar este recurso.'
      });
    }
    next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se é dono da loja
export const requireStoreOwner = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId || req.query.storeId;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'ID da loja é obrigatório'
      });
    }

    // Admin master tem acesso a todas as lojas
    if (req.user.role === 'admin_master') {
      return next();
    }

    // Verificar se o usuário é dono da loja
    const storeUserResult = await query(
      'SELECT * FROM store_users WHERE user_id = $1 AND store_id = $2',
      [req.user.id, storeId]
    );

    if (storeUserResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar esta loja.'
      });
    }

    req.storeUser = storeUserResult.rows[0];
    next();
  } catch (error) {
    console.error('Erro na verificação de dono da loja:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar permissões específicas
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Admin master tem todas as permissões
      if (req.user.role === 'admin_master') {
        return next();
      }

      // Verificar permissão específica do usuário da loja
      if (!req.storeUser || !req.storeUser.permissions) {
        return res.status(403).json({
          success: false,
          message: 'Permissões não encontradas'
        });
      }

      const permissions = req.storeUser.permissions;
      if (!permissions[permission]) {
        return res.status(403).json({
          success: false,
          message: `Permissão '${permission}' requerida`
        });
      }

      next();
    } catch (error) {
      console.error('Erro na verificação de permissão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};