import express from 'express';
import { query } from '../config/database.js';
import { authenticate, requireStoreAdmin } from '../middleware/auth.js';

const router = express.Router();

// Função para gerar código único da loja
const generateUniqueStoreCode = async (storeName, storeId, customCode = null) => {
  if (customCode) {
    // Verificar se o código customizado já existe
    const existing = await query(`
      SELECT id FROM stores WHERE store_code = ? AND id != ?
    `, [customCode, storeId]);
    
    if (existing.length > 0) {
      throw new Error('Código da loja já existe');
    }
    return customCode;
  }
  
  // Gerar código baseado no nome da loja
  const cleanName = storeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
    .substring(0, 8); // Máximo 8 caracteres
  
  let baseCode = `${cleanName}${String(storeId).padStart(3, '0')}`.toUpperCase();
  
  // Verificar se o código já existe
  const existingCode = await query(`
    SELECT id FROM stores WHERE store_code = ? AND id != ?
  `, [baseCode, storeId]);
  
  // Se existir, adicionar sufixo numérico
  if (existingCode.length > 0) {
    let counter = 1;
    do {
      baseCode = `${cleanName}${String(storeId).padStart(3, '0')}${counter}`.toUpperCase();
      const checkCode = await query(`
        SELECT id FROM stores WHERE store_code = ?
      `, [baseCode]);
      if (checkCode.length === 0) break;
      counter++;
    } while (counter < 100); // Limite de segurança
  }
  
  return baseCode;
};

// GET /api/stores - Listar lojas públicas
router.get('/', async (req, res) => {
  try {
    const storesResult = await query(`
      SELECT id, store_code, store_name, store_description, logo_url,
             primary_color, secondary_color, domain, plano
      FROM stores
      WHERE is_active = true
      ORDER BY store_name
    `);
    res.json({ success: true, data: storesResult });
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
             COUNT(DISTINCT c.id) as total_categories,
             st.plano as plan
      FROM stores s
      LEFT JOIN products p ON s.id = p.storeId
      LEFT JOIN categories c ON s.id = c.storeId
      LEFT JOIN settings st ON s.id = st.storeId
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

// POST /api/stores/register - Cadastro público via wizard
router.post('/register', async (req, res) => {
  try {
    const { name, email, whatsapp, cnpj, plan } = req.body

    if (!name || !email || !whatsapp || !cnpj || !plan) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      })
    }

    // Importar bcrypt para hash da senha
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default || bcryptModule;
    
    // Gerar hash da senha
    const senha = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5QqQqQq'; // Placeholder, will be replaced

    // Inserir a loja (tratando valores nulos)
    const storeResult = await query(`
      INSERT INTO stores (
        name, email, whatsapp_number, description, cnpj, inscricao_estadual,
        address, instagram, facebook, youtube, horarios,
        politicas_troca, politicas_gerais, senha, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
    `, [
      name || '',
      email || '',
      whatsapp || '',
      '', // description will be updated later
      cnpj || '',
      '', // inscricao_estadual will be updated later
      '', // address will be updated later
      '', // instagram will be updated later
      '', // facebook will be updated later
      '', // youtube will be updated later
      '', // horarios will be updated later
      '', // politicas_troca will be updated later
      '', // politicas_gerais will be updated later
      senha
    ]);

    const storeId = storeResult.insertId;
    
    // Gerar código único da loja
    const generatedStoreCode = await generateUniqueStoreCode(name, storeId, null);
    
    // Atualizar a loja com o store_code e dados adicionais
    await query(`
      UPDATE stores 
      SET store_code = ?, store_name = ?, store_description = ?, 
          whatsapp_number = ?, address = ?, is_active = true
      WHERE id = ?
    `, [generatedStoreCode, name, '', whatsapp, '', storeId]);

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

    // Criar aparência com cores escolhidas
    await query(`
      INSERT INTO appearance (storeId, cor_primaria, cor_secundaria, cor_botoes) 
      VALUES (?, ?, ?, ?)
    `, [storeId, '#000000', '#666666', '#000000']);
    
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
        store: {
          id: storeId,
          name: name,
          email: email
        },
        storeCode: generatedStoreCode,
        plan
      }
    });
  } catch (error) {
    console.error('❌ Erro ao registrar loja:', error.message)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
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
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default || bcryptModule;
    
    // Gerar hash da senha
    const senha = password ? await bcrypt.hash(password, 12) : '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5QqQqQq';

    // Inserir a loja
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
    
    // Gerar store_code baseado no ID
    const generatedStoreCode = store_code || `STORE${String(storeId).padStart(3, '0')}`;
    
    // Atualizar a loja com o store_code e dados adicionais
    await query(`
      UPDATE stores 
      SET store_code = ?, store_name = ?, store_description = ?, 
          whatsapp_number = ?, address = ?, is_active = true
      WHERE id = ?
    `, [generatedStoreCode, name, description, whatsapp, endereco, storeId]);

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

    // Preparar valores substituindo undefined por null
    const values = [
      name ?? null,
      email ?? null,
      whatsapp ?? null,
      description ?? null,
      cnpj ?? null,
      inscricao_estadual ?? null,
      endereco ?? null,
      instagram ?? null,
      facebook ?? null,
      youtube ?? null,
      horarios ?? null,
      politicas_troca ?? null,
      politicas_gerais ?? null,
      name ?? null,
      description ?? null,
      id
    ];

    const result = await query(`
      UPDATE stores SET 
        name = ?, email = ?, whatsapp_number = ?, description = ?,
        cnpj = ?, inscricao_estadual = ?, address = ?,
        instagram = ?, facebook = ?, youtube = ?, horarios = ?,
        politicas_troca = ?, politicas_gerais = ?,
        store_name = ?, store_description = ?
      WHERE id = ?
    `, values);

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
      UPDATE stores SET isActive = false, is_active = false WHERE id = ?
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
    if (storeResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Loja não encontrada' });
    }
    res.json({ success: true, data: storeResult[0] });
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
      SELECT s.*, st.plano, st.limite_produtos, st.limite_fotos_produto
      FROM stores s
      LEFT JOIN settings st ON s.id = st.storeId
      WHERE s.id = ? AND s.is_active = true
    `, [id]);
    
    if (storeResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Loja não encontrada' });
    }

    const storeData = storeResult[0];
    
    // Adicionar settings como objeto
    const settings = {
      limite_produtos: storeData.limite_produtos,
      limite_fotos_produto: storeData.limite_fotos_produto,
      plano: storeData.plano
    };

    res.json({ 
      success: true, 
      data: {
        ...storeData,
        settings
      }
    });
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

    const rows = await query(
      'SELECT id, name FROM stores WHERE domain = ? OR subdomain = ? LIMIT 1',
      [host, host]
    );

    if (rows.length === 0) {
      // Fallback: se não achar, tenta com um storeId padrão para desenvolvimento
      const defaultStore = await query('SELECT id, name FROM stores WHERE id = ? LIMIT 1', [1]);
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

// GET /api/store-limits - Buscar limites da loja
router.get('/limits', authenticate, async (req, res) => {
  try {
    const storeId = req.query.storeId ? Number(req.query.storeId) : req.user.storeId;
    
    // Buscar configurações da loja
    const settings = await query(`
      SELECT plano, limite_produtos, limite_fotos_produto 
      FROM settings 
      WHERE storeId = ?
    `, [storeId]);
    
    if (settings.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Configurações da loja não encontradas' 
      });
    }
    
    // Contar produtos atuais
    const productCount = await query(`
      SELECT COUNT(*) as total 
      FROM products 
      WHERE storeId = ?
    `, [storeId]);
    
    const config = settings[0];
    const currentProducts = productCount[0].total;
    const limitProducts = config.limite_produtos;
    const limitPhotos = config.limite_fotos_produto;
    
    // Calcular percentual usado
    const percentUsed = Math.round((currentProducts / limitProducts) * 100);
    
    // Verificar se pode cadastrar mais
    const canAddProduct = currentProducts < limitProducts;
    
    // Status do limite
    let status = 'ok';
    if (percentUsed >= 100) status = 'exceeded';
    else if (percentUsed >= 80) status = 'warning';
    else if (percentUsed >= 60) status = 'caution';
    
    res.json({
      success: true,
      data: {
        plano: config.plano,
        products: {
          current: currentProducts,
          limit: limitProducts,
          remaining: limitProducts - currentProducts,
          percentUsed,
          canAdd: canAddProduct,
          status
        },
        photos: {
          limitPerProduct: limitPhotos
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar limites:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

export default router;