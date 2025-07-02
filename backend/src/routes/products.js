import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/products - Listar produtos
router.get('/', async (req, res) => {
  try {
    const {
      store_id,
      category_id,
      status = 'active',
      is_featured,
      search,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Filtros
    if (store_id) {
      conditions.push(`p.store_id = $${paramCount}`);
      values.push(store_id);
      paramCount++;
    }

    if (category_id) {
      conditions.push(`p.category_id = $${paramCount}`);
      values.push(category_id);
      paramCount++;
    }

    if (status) {
      conditions.push(`p.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (is_featured !== undefined) {
      conditions.push(`p.is_featured = $${paramCount}`);
      values.push(is_featured === 'true');
      paramCount++;
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query principal
    const productsResult = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.store_name,
        s.store_code,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary
            ) ORDER BY pi.sort_order, pi.is_primary DESC
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      ${whereClause}
      GROUP BY p.id, c.name, c.slug, s.store_name, s.store_code
      ORDER BY p.${sort_by} ${sort_order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...values, limit, offset]);

    // Contar total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `, values);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products: productsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/products/:id - Buscar produto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.store_name,
        s.store_code,
        s.whatsapp_number,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary
            ) ORDER BY pi.sort_order, pi.is_primary DESC
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stores s ON p.store_id = s.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.name, c.slug, s.store_name, s.store_code, s.whatsapp_number
    `, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: productResult.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;