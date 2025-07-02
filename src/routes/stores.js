import express from 'express';
import { query, transaction } from '../config/database.js';
import { authenticate, requireAdminMaster, requireStoreOwner } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// GET /api/stores - Listar todas as lojas (Admin Master) ou lojas do usuário
router.get('/', authenticate, async (req, res) => {
  try {
    let storesResult;

    if (req.user.role === 'admin_master') {
      // Admin Master vê todas as lojas
      storesResult = await query(`
        SELECT s.*, u.name as created_by_name
        FROM stores s
        LEFT JOIN users u ON s.created_by = u.id
        ORDER BY s.created_at DESC
      `);
    } else if (req.user.role === 'store_owner') {
      // Store Owner vê apenas suas lojas
      storesResult = await query(`
        SELECT s.*, su.permissions
        FROM stores s
        JOIN store_users su ON s.id = su.store_id
        WHERE su.user_id = $1 AND s.is_active = true
        ORDER BY s.created_at DESC
      `, [req.user.id]);
    } else {
      // Clientes veem apenas lojas ativas (público)
      storesResult = await query(`
        SELECT id, store_code, store_name, store_description, logo_url,
               primary_color, secondary_color, domain
        FROM stores
        WHERE is_active = true
        ORDER BY store_name
      `);
    }

    res.json({
      success: true,
      data: storesResult.rows
    });

  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/stores/:id - Buscar loja específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const storeResult = await query(`
      SELECT s.*, u.name as created_by_name
      FROM stores s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
    `, [id]);

    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada'
      });
    }

    const store = storeResult.rows[0];

    // Se não for admin master, verificar se a loja está ativa
    if (req.user?.role !== 'admin_master' && !store.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada'
      });
    }

    res.json({
      success: true,
      data: store
    });

  } catch (error) {
    console.error('Erro ao buscar loja:', error);
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
      WHERE store_code = $1 AND is_active = true
    `, [storeCode]);

    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada'
      });
    }

    res.json({
      success: true,
      data: storeResult.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar loja por código:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/stores - Criar nova loja (Admin Master)
router.post('/', authenticate, requireAdminMaster, validate(schemas.createStore), async (req, res) => {
  try {
    const {
      store_name,
      store_description,
      whatsapp_number,
      email,
      address,
      city,
      state,
      zip_code,
      owner_email,
      owner_name,
      owner_password
    } = req.body;

    const result = await transaction(async (client) => {
      // Gerar código único da loja
      const storeCodeResult = await client.query('SELECT generate_store_code() as code');
      const storeCode = storeCodeResult.rows[0].code;

      // Criar loja
      const storeResult = await client.query(`
        INSERT INTO stores (
          store_code, store_name, store_description, whatsapp_number,
          email, address, city, state, zip_code, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        storeCode, store_name, store_description, whatsapp_number,
        email, address, city, state, zip_code, req.user.id
      ]);

      const store = storeResult.rows[0];

      // Se fornecido dados do dono, criar usuário
      if (owner_email && owner_name && owner_password) {
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(owner_password, 12);

        const ownerResult = await client.query(`
          INSERT INTO users (name, email, password_hash, role, is_active, email_verified)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [owner_name, owner_email, passwordHash, 'store_owner', true, true]);

        const ownerId = ownerResult.rows[0].id;

        // Associar usuário à loja
        await client.query(`
          INSERT INTO store_users (user_id, store_id, permissions)
          VALUES ($1, $2, $3)
        `, [
          ownerId,
          store.id,
          JSON.stringify({
            manage_products: true,
            manage_orders: true,
            manage_categories: true,
            manage_banners: true,
            view_analytics: true
          })
        ]);
      }

      return store;
    });

    res.status(201).json({
      success: true,
      message: 'Loja criada com sucesso',
      data: result
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
router.put('/:id', authenticate, validate(schemas.updateStore), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissões
    if (req.user.role !== 'admin_master') {
      const storeUserResult = await query(
        'SELECT * FROM store_users WHERE user_id = $1 AND store_id = $2',
        [req.user.id, id]
      );

      if (storeUserResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    // Construir query dinâmica
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(req.body[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    updateValues.push(id);

    const storeResult = await query(`
      UPDATE stores 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `, updateValues);

    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Loja atualizada com sucesso',
      data: storeResult.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/stores/:id - Desativar loja (Admin Master)
router.delete('/:id', authenticate, requireAdminMaster, async (req, res) => {
  try {
    const { id } = req.params;

    const storeResult = await query(`
      UPDATE stores 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (storeResult.rows.length === 0) {
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
    console.error('Erro ao desativar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;