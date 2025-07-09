import express from 'express';
import { query } from '../config/database.js';
import { authenticate, requireStoreAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stores - Listar lojas públicas
router.get('/', async (req, res) => {
  try {
    const storesResult = await query(`
      SELECT id, store_code, store_name, store_description, logo_url,
             primary_color, secondary_color, domain
      FROM stores
      WHERE is_active = true
      ORDER BY store_name
    `);
    res.json({ success: true, data: storesResult.rows });
  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/stores/admin - Listar lojas (admin)
router.get('/admin', authenticate, requireStoreAdmin, async (req, res) => {
  try {
    let queryStr = `
      SELECT s.*, 
             COUNT(p.id) as total_products,
             COUNT(DISTINCT c.id) as total_categories
      FROM stores s
      LEFT JOIN products p ON s.id = p.storeId
      LEFT JOIN categories c ON s.id = c.storeId
    `;
    
    const params = [];
    
    // Se não for admin_master, filtrar apenas pela loja do usuário
    if (req.user.tipo !== 'admin_master') {
      queryStr += ' WHERE s.id = ?';
      params.push(req.user.storeId);
    }
    
    queryStr += ' GROUP BY s.id ORDER BY s.createdAt DESC';
    
    const stores = await query(queryStr, params);
    
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

// POST /api/stores - Criar nova loja (admin)
router.post('/', authenticate, requireStoreAdmin, async (req, res) => {
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
    const bcrypt = await import('bcryptjs');
    
    // Gerar hash da senha
    const senha = password ? await bcrypt.hash(password, 12) : '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5QqQqQq';

    // Inserir a loja
    const storeResult = await query(`
      INSERT INTO stores (
        name, email, whatsapp, description, cnpj, inscricao_estadual,
        endereco, instagram, facebook, youtube, horarios,
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
    
    // Gerar store_code baseado no ID
    const generatedStoreCode = store_code || `STORE${String(storeId).padStart(3, '0')}`;
    
    // Atualizar a loja com o store_code
    await query(`
      UPDATE stores 
      SET store_code = ?
      WHERE id = ?
    `, [generatedStoreCode, storeId]);

    // Criar configurações padrão
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

// PUT /api/stores/:id - Atualizar loja
router.put('/:id', authenticate, requireStoreAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, whatsapp, description, cnpj, inscricao_estadual,
      endereco, instagram, facebook, youtube, horarios,
      politicas_troca, politicas_gerais
    } = req.body;

    // Verificar se o usuário tem permissão para editar esta loja
    if (req.user.tipo !== 'admin_master' && req.user.storeId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const result = await query(`
      UPDATE stores SET 
        name = ?, email = ?, whatsapp = ?, description = ?,
        cnpj = ?, inscricao_estadual = ?, endereco = ?,
        instagram = ?, facebook = ?, youtube = ?, horarios = ?,
        politicas_troca = ?, politicas_gerais = ?
      WHERE id = ?
    `, [
      name, email, whatsapp, description, cnpj, inscricao_estadual,
      endereco, instagram, facebook, youtube, horarios,
      politicas_troca, politicas_gerais, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Loja atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/stores/:id - Deletar loja
router.delete('/:id', authenticate, requireStoreAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário tem permissão para deletar esta loja
    if (req.user.tipo !== 'admin_master' && req.user.storeId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const result = await query(`
      UPDATE stores SET isActive = false WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Loja desativada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/stores/code/:storeCode - Buscar loja por código
router.get('/code/:storeCode', async (req, res) => {
  try {
    const { storeCode } = req.params;
    const storeResult = await query(`
      SELECT id, store_code, store_name, store_description, logo_url,
             primary_color, secondary_color, whatsapp_number, email,
             address, city, state, settings
      FROM stores
      WHERE store_code = ? AND is_active = true
    `, [storeCode]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Loja não encontrada' });
    }
    res.json({ success: true, data: storeResult.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar loja por código:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/stores/:id - Buscar loja por id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID da loja é obrigatório.' });
    }
    const storeResult = await query(`
      SELECT id, store_code, store_name, store_description, logo_url,
             primary_color, secondary_color, whatsapp_number, email,
             address, city, state, settings, domain
      FROM stores
      WHERE id = ? AND is_active = true
    `, [id]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Loja não encontrada' });
    }
    res.json({ success: true, data: storeResult.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar loja por id:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// GET /api/resolve-store - Resolver storeId pelo host
router.get('/resolve-store', async (req, res) => {
  try {
    const { host } = req.query;
    if (!host) {
      return res.status(400).json({ success: false, message: 'Host não informado.' });
    }

    const [rows] = await query(
      'SELECT id, name FROM stores WHERE domain = ? OR subdomain = ? LIMIT 1',
      [host, host]
    );

    if (rows.length === 0) {
      // Fallback: se não achar, tenta com um storeId padrão para desenvolvimento
      const [defaultStore] = await query('SELECT id, name FROM stores WHERE id = ? LIMIT 1', [1]);
      if (defaultStore.length > 0) {
        return res.json({ success: true, storeId: defaultStore[0].id, store: defaultStore[0] });
      }
      return res.status(404).json({ success: false, message: 'Loja não encontrada para este domínio.' });
    }

    const store = rows[0];
    res.json({ success: true, storeId: store.id, store });
  } catch (error) {
    console.error('Erro ao resolver storeId:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

export default router;