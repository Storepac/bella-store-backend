import { query } from '../../src/config/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { store_id, position } = req.query;
    
    let whereConditions = ['b.is_active = true'];
    let queryParams = [];
    let paramCount = 0;

    // Filtrar por data (banners ativos)
    whereConditions.push('(b.start_date IS NULL OR b.start_date <= NOW())');
    whereConditions.push('(b.end_date IS NULL OR b.end_date >= NOW())');

    if (store_id) {
      paramCount++;
      whereConditions.push(`b.store_id = $${paramCount}`);
      queryParams.push(store_id);
    }

    if (position) {
      paramCount++;
      whereConditions.push(`b.position = $${paramCount}`);
      queryParams.push(position);
    }

    const result = await query(`
      SELECT 
        b.id,
        b.title,
        b.subtitle,
        b.image_url,
        b.mobile_image_url,
        b.link_url,
        b.button_text,
        b.position,
        b.sort_order,
        s.store_name,
        b.created_at
      FROM banners b
      LEFT JOIN stores s ON b.store_id = s.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY b.sort_order, b.created_at DESC
    `, queryParams);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
} 