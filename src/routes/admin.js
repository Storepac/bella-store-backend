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
    const { 
      name, 
      email, 
      whatsapp, 
      description,
      cnpj,
      inscricao_estadual,
      endereco,
      instagram,
      facebook,
      youtube,
      horarios,
      politicas_troca,
      politicas_gerais,
      plan = 'Start',
      store_code,
      password
    } = req.body;

    // Importar bcrypt para hash da senha
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default || bcryptModule;
    
    // Gerar hash da senha
    const senha = password ? await bcrypt.hash(password, 12) : '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5QqQqQq'; // senha padrão: 123

    // Primeiro, inserir a loja sem o store_code
    const storeResult = await query(`
      INSERT INTO stores (
        name, email, whatsapp_number, description, cnpj, inscricao_estadual,
        address, instagram, facebook, youtube, horarios,
        politicas_troca, politicas_gerais, senha, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      name, 
      email, 
      whatsapp, 
      description,
      cnpj,
      inscricao_estadual,
      endereco,
      instagram,
      facebook,
      youtube,
      horarios,
      politicas_troca,
      politicas_gerais,
      senha
    ]);

    const storeId = storeResult.insertId;
    
    // Gerar store_code e codigo baseados no ID
    const generatedStoreCode = store_code || `STORE${String(storeId).padStart(3, '0')}`;
    const codigo = generatedStoreCode;
    
    // Atualizar a loja com o store_code e codigo
    await query(`
      UPDATE stores 
      SET store_code = ?, codigo = ?
      WHERE id = ?
    `, [generatedStoreCode, codigo, storeId]);

    // Criar configurações padrão baseadas no plano
    const limitesPorPlano = {
      'Start': { produtos: 500, fotos: 2 },
      'Pro': { produtos: 1000, fotos: 3 },
      'Max': { produtos: 9999, fotos: 4 }
    };
    
    const limites = limitesPorPlano[plan] || limitesPorPlano['Start'];
    
    await query(`
      INSERT INTO settings (storeId, plano, limite_produtos, limite_fotos_produto) 
      VALUES (?, ?, ?, ?)
    `, [storeId, plan, limites.produtos, limites.fotos]);

    // Criar aparência padrão
    await query(`
      INSERT INTO appearance (storeId, cor_primaria, cor_secundaria, cor_botoes) 
      VALUES (?, '#000000', '#666666', '#000000')
    `, [storeId]);
    
    // Criar usuário admin_loja
    await query(`
      INSERT INTO users (name, email, senha, tipo, storeId, isActive) 
      VALUES (?, ?, ?, 'admin_loja', ?, true)
    `, [
      name, 
      email || `${generatedStoreCode}@example.com`, 
      senha, 
      storeId
    ]);

    res.status(201).json({
      success: true,
      message: 'Loja criada com sucesso',
      data: { 
        id: storeId,
        store_code: generatedStoreCode
      }
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
    const [totalStoresResult] = await query('SELECT COUNT(*) as count FROM stores');
    const [totalUsersResult] = await query('SELECT COUNT(*) as count FROM users');
    const [totalProductsResult] = await query('SELECT COUNT(*) as count FROM products');
    const [totalOrdersResult] = await query('SELECT COUNT(*) as count FROM orders');

    res.json({
      success: true,
      data: {
        totalStores: totalStoresResult.count,
        totalUsers: totalUsersResult.count,
        totalProducts: totalProductsResult.count,
        totalOrders: totalOrdersResult.count
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