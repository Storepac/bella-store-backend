import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { validate, schemas } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/login
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    const user = userResult.rows[0];

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Buscar informações adicionais baseadas no role
    let additionalInfo = {};
    
    if (user.role === 'admin_master') {
      const adminResult = await query(
        'SELECT permissions FROM admin_users WHERE user_id = $1',
        [user.id]
      );
      additionalInfo.permissions = adminResult.rows[0]?.permissions || {};
    } else if (user.role === 'store_owner') {
      const storeResult = await query(`
        SELECT s.*, su.permissions 
        FROM stores s 
        JOIN store_users su ON s.id = su.store_id 
        WHERE su.user_id = $1 AND s.is_active = true
      `, [user.id]);
      additionalInfo.stores = storeResult.rows;
    }

    // Gerar token
    const token = generateToken(user.id);

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          ...userWithoutPassword,
          ...additionalInfo
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/register
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está em uso'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const userResult = await query(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role, created_at
    `, [name, email, passwordHash, phone, 'customer']);

    const user = userResult.rows[0];

    // Gerar token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;

    // Buscar informações adicionais baseadas no role
    let additionalInfo = {};
    
    if (req.user.role === 'admin_master') {
      const adminResult = await query(
        'SELECT permissions FROM admin_users WHERE user_id = $1',
        [req.user.id]
      );
      additionalInfo.permissions = adminResult.rows[0]?.permissions || {};
    } else if (req.user.role === 'store_owner') {
      const storeResult = await query(`
        SELECT s.*, su.permissions 
        FROM stores s 
        JOIN store_users su ON s.id = su.store_id 
        WHERE su.user_id = $1 AND s.is_active = true
      `, [req.user.id]);
      additionalInfo.stores = storeResult.rows;
    }

    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          ...additionalInfo
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;