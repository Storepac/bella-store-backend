import express from 'express';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware para verificar se é admin master
const requireAdminMaster = async (req, res, next) => {
  if (req.user.tipo !== 'admin_master') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas admin master pode acessar esta rota.'
    });
  }
  next();
};

// GET /api/admin/stores - Listar todas as lojas (admin master)
router.get('/stores', authenticate, requireAdminMaster, async (req, res) => {
  try {
    const stores = await query(`
      SELECT s.*, 
             COUNT(p.id) as total_products,
             COUNT(DISTINCT c.id) as total_categories
      FROM stores s
      LEFT JOIN products p ON s.id = p.storeId
      LEFT JOIN categories c ON s.id = c.storeId
      GROUP BY s.id
      ORDER BY s.createdAt DESC
    `);

    res.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/users - Listar todos os usuários (admin master)
router.get('/users', authenticate, requireAdminMaster, async (req, res) => {
  try {
    const users = await query(`
      SELECT u.*, s.name as store_name
      FROM users u
      LEFT JOIN stores s ON u.storeId = s.id
      ORDER BY u.createdAt DESC
    `);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/admin/stores - Criar nova loja (admin master)
router.post('/stores', authenticate, requireAdminMaster, async (req, res) => {
  try {
    const { name, email, whatsapp, description } = req.body;

    // Criar loja
    const storeResult = await query(`
      INSERT INTO stores (name, email, whatsapp, description, store_code, codigo, senha, isActive) 
      VALUES (?, ?, ?, ?, ?, ?, ?, true)
    `, [
      name, 
      email, 
      whatsapp, 
      description,
      `STORE${String(storeResult.insertId).padStart(3, '0')}`,
      `STORE${String(storeResult.insertId).padStart(3, '0')}`,
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5QqQqQq' // senha: 123
    ]);

    const storeId = storeResult.insertId;

    // Criar configurações padrão
    await query(`
      INSERT INTO settings (storeId, plano, limite_produtos, limite_fotos_produto) 
      VALUES (?, 'Start', 500, 2)
    `, [storeId]);

    // Criar aparência padrão
    await query(`
      INSERT INTO appearance (storeId, cor_primaria, cor_secundaria, cor_botoes) 
      VALUES (?, '#000000', '#666666', '#000000')
    `, [storeId]);

    res.status(201).json({
      success: true,
      message: 'Loja criada com sucesso',
      data: { storeId }
    });
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/overview - Visão geral do sistema (admin master)
router.get('/overview', authenticate, requireAdminMaster, async (req, res) => {
  try {
    const [totalStores] = await query('SELECT COUNT(*) as count FROM stores');
    const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');
    const [totalProducts] = await query('SELECT COUNT(*) as count FROM products');
    const [totalOrders] = await query('SELECT COUNT(*) as count FROM orders');

    res.json({
      success: true,
      data: {
        totalStores: totalStores.count,
        totalUsers: totalUsers.count,
        totalProducts: totalProducts.count,
        totalOrders: totalOrders.count
      }
    });
  } catch (error) {
    console.error('Erro ao buscar overview:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router; 