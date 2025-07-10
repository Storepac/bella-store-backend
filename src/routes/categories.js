import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/categories - Listar categorias
router.get('/', async (req, res) => {
  try {
    const { storeId } = req.query;

    let whereClause = 'WHERE c.isActive = true';
    const values = [];

    if (storeId) {
      whereClause += ' AND c.storeId = ?';
      values.push(storeId);
    }

    const categoriesResult = await query(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.categoryId AND p.status = 'active'
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
    `, values);

    res.json({
      success: true,
      data: categoriesResult
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