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

export default router;