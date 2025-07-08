import express from 'express';
import { query } from '../config/database.js';

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
      WHERE id = $1 AND is_active = true
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

// PUT /api/stores/:id - Atualizar dados da loja
router.put('/:id', async (req, res) => {
  console.log(`[BACKEND] Rota PUT /api/stores/:id recebida para o ID: ${req.params.id}`);
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID da loja é obrigatório.' });
    }

    const {
      store_name, store_description, logo_url, primary_color, secondary_color,
      whatsapp_number, email, address, city, state, settings, domain
    } = req.body;

    const fields = [];
    const values = [];

    const addField = (field, value) => {
      if (value !== undefined) {
        fields.push(`${field} = ?`);
        values.push(value);
      }
    };

    addField('store_name', store_name);
    addField('store_description', store_description);
    addField('logo_url', logo_url);
    addField('primary_color', primary_color);
    addField('secondary_color', secondary_color);
    addField('whatsapp_number', whatsapp_number);
    addField('email', email);
    addField('address', address);
    addField('city', city);
    addField('state', state);
    addField('settings', settings);
    addField('domain', domain);

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar.' });
    }

    values.push(id);
    const updateQuery = `UPDATE stores SET ${fields.join(', ')} WHERE id = ?`;

    console.log('Executando query de atualização:', { query: updateQuery, values });

    const result = await query(updateQuery, values);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Nenhuma loja encontrada com este ID para atualizar.' });
    }

    res.json({ success: true, message: 'Loja atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar loja.' });
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