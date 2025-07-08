import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/banners - Listar banners
router.get('/', async (req, res) => {
  try {
    const { store_id, position } = req.query;

    const conditions = ['is_active = true'];
    const values = [];
    let paramCount = 1;

    if (store_id) {
      conditions.push(`store_id = $${paramCount}`);
      values.push(store_id);
      paramCount++;
    }

    if (position) {
      conditions.push(`position = $${paramCount}`);
      values.push(position);
      paramCount++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const bannersResult = await query(`
      SELECT *
      FROM banners
      ${whereClause}
      ORDER BY sort_order, created_at DESC
    `, values);

    res.json({
      success: true,
      data: bannersResult.rows
    });

  } catch (error) {
    console.error('Erro ao listar banners:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;