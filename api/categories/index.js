import { query } from '../../src/config/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { store_id } = req.query;
    
    let whereCondition = 'c.is_active = true';
    let queryParams = [];

    if (store_id) {
      whereCondition += ' AND c.store_id = $1';
      queryParams.push(store_id);
    }

    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image_url,
        c.sort_order,
        c.parent_id,
        s.store_name,
        (
          SELECT COUNT(*)::int
          FROM products p 
          WHERE p.category_id = c.id AND p.status = 'active'
        ) as products_count
      FROM categories c
      LEFT JOIN stores s ON c.store_id = s.id
      WHERE ${whereCondition}
      ORDER BY c.sort_order, c.name
    `, queryParams);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
} 