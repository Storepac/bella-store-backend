import { query } from '../../src/config/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { store_id, category_id, search, page = 1, limit = 20 } = req.query;
    
    let whereConditions = ['p.status = $1'];
    let queryParams = ['active'];
    let paramCount = 1;

    if (store_id) {
      paramCount++;
      whereConditions.push(`p.store_id = $${paramCount}`);
      queryParams.push(store_id);
    }

    if (category_id) {
      paramCount++;
      whereConditions.push(`p.category_id = $${paramCount}`);
      queryParams.push(category_id);
    }

    if (search) {
      paramCount++;
      whereConditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.short_description,
        p.price,
        p.compare_price,
        p.sku,
        p.stock_quantity,
        p.is_featured,
        p.tags,
        p.created_at,
        c.name as category_name,
        s.store_name,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary
            ) ORDER BY pi.sort_order, pi.is_primary DESC
          )
          FROM product_images pi 
          WHERE pi.product_id = p.id
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stores s ON p.store_id = s.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    const result = await query(sqlQuery, queryParams);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
} 