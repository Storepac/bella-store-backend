import { query } from '../../src/config/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(`
      SELECT 
        id,
        store_code,
        store_name,
        store_description,
        logo_url,
        primary_color,
        secondary_color,
        whatsapp_number,
        email,
        address,
        city,
        state,
        is_active,
        created_at
      FROM stores 
      WHERE is_active = true
      ORDER BY store_name
    `);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
} 