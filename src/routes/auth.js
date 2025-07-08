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
router.post('/login', async (req, res) => {
  try {
    const { email, codigo, password } = req.body;

    let user = null;

    if (email) {
      // Login admin master por e-mail
      const userResult = await query(
        'SELECT * FROM users WHERE email = ? AND tipo = ?',
        [email, 'admin_master']
      );
      if (userResult.length > 0) {
        user = userResult[0];
      }
    } else if (codigo) {
      const codigoLimpo = codigo.trim().toLowerCase();
      // Login lojista por código da loja
      let lojaResult = await query(
        'SELECT id, isActive FROM stores WHERE LOWER(store_code)=LOWER(?)',
        [codigoLimpo]
      );
      // Se não encontrou por store_code, tenta por codigo
      if (lojaResult.length === 0) {
        lojaResult = await query(
          'SELECT id, isActive FROM stores WHERE LOWER(codigo)=LOWER(?)',
          [codigoLimpo]
        );
      }
      if (lojaResult.length === 0) {
        return res.status(401).json({ success: false, message: 'Código da loja incorreto' });
      }
      if (!lojaResult[0].isActive) {
        return res.status(403).json({ success:false, message:'Loja pausada – contate o administrador.' });
      }
      const storeId = lojaResult[0].id;
      let userResult = await query('SELECT * FROM users WHERE storeId = ? AND tipo = ?', [storeId, 'admin_loja']);
      if (userResult.length > 0) {
        user = userResult[0];
      } else {
        // Não existe usuário admin_loja ainda, vamos buscar a senha da loja e validar
        const storeSenhaRes = await query('SELECT name, email, senha FROM stores WHERE id = ?', [storeId]);
        if (storeSenhaRes.length === 0) {
          return res.status(401).json({ success:false, message:'Loja não encontrada' });
        }
        const storeRow = storeSenhaRes[0];
        const isPassOk = await bcrypt.compare(password, storeRow.senha);
        if (!isPassOk) {
          return res.status(401).json({ success:false, message:'Senha incorreta' });
        }
        // Criar usuário admin_loja automaticamente
        const insertUser = await query('INSERT INTO users (name, email, senha, tipo, storeId) VALUES (?,?,?,?,?)', [storeRow.name || codigo, storeRow.email || `${codigo}@example.com`, storeRow.senha, 'admin_loja', storeId]);
        const newUserId = insertUser.insertId;
        user = { id: newUserId, name: storeRow.name, email: storeRow.email, senha: storeRow.senha, tipo: 'admin_loja', storeId };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou credenciais inválidas'
      });
    }

    // Verificar senha (texto puro, por enquanto)
    const isValidPassword = await bcrypt.compare(password, user.senha);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        tipo: user.tipo,
        storeId: user.storeId || null
      },
      process.env.JWT_SECRET || 'segredo',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remover senha do retorno
    const { senha, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
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