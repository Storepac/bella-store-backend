import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/store-data
// Retorna dados da loja. Pode ser filtrado por storeId ou host.
router.get('/', async (req, res) => {
  try {
    const { storeId, host } = req.query;

    let rows = [];

    if (storeId) {
      rows = await query('SELECT * FROM stores WHERE id = ? LIMIT 1', [storeId]);
    } else if (host) {
      rows = await query('SELECT * FROM stores WHERE domain = ? OR subdomain = ? LIMIT 1', [host, host]);
    } else {
      // Fallback: primeira loja ativa
      rows = await query('SELECT * FROM stores WHERE isActive = true LIMIT 1');
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Loja não encontrada' });
    }

    const store = rows[0];

    // Podemos buscar configurações adicionais se existirem
    const settingsRows = await query('SELECT * FROM settings WHERE storeId = ? LIMIT 1', [store.id]);
    if (settingsRows.length) {
      store.settings = settingsRows[0];
      store.plano = settingsRows[0].plano;
    }

    res.json({ success: true, data: store });
  } catch (error) {
    console.error('Erro em /api/store-data:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router; 