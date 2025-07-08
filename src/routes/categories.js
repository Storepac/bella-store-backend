import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/categories - Listar categorias
router.get('/', async (req, res) => {
  try {
    const { store_id } = req.query;

    let whereClause = 'WHERE is_active = true';
    const values = [];

    if (store_id) {
      whereClause += ' AND store_id = $1';
      values.push(store_id);
    }

    const categoriesResult = await query(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `, values);

    res.json({
      success: true,
      data: categoriesResult.rows
    });

  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;