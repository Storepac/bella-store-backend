import express from 'express';
import { query, transaction } from '../config/database.js';
import { authenticate, requireStoreOwner, requirePermission } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

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

// POST /api/products - Criar produto
router.post('/', 
  authenticate, 
  requireStoreOwner, 
  requirePermission('manage_products'),
  validate(schemas.createProduct), 
  async (req, res) => {
    try {
      const storeId = req.params.storeId || req.body.store_id;
      const {
        name,
        description,
        short_description,
        price,
        compare_price,
        category_id,
        sku,
        stock_quantity = 0,
        weight,
        status = 'active',
        is_featured = false,
        images = []
      } = req.body;

      const result = await transaction(async (client) => {
        // Criar produto
        const productResult = await client.query(`
          INSERT INTO products (
            store_id, category_id, name, description, short_description,
            price, compare_price, sku, stock_quantity, weight, status, is_featured
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `, [
          storeId, category_id, name, description, short_description,
          price, compare_price, sku, stock_quantity, weight, status, is_featured
        ]);

        const product = productResult.rows[0];

        // Adicionar imagens se fornecidas
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            await client.query(`
              INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              product.id,
              image.url,
              image.alt_text || name,
              i,
              i === 0 // Primeira imagem é primária
            ]);
          }
        }

        return product;
      });

      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: result
      });

    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

// PUT /api/products/:id - Atualizar produto
router.put('/:id',
  authenticate,
  requireStoreOwner,
  requirePermission('manage_products'),
  validate(schemas.updateProduct),
  async (req, res) => {
    try {
      const { id } = req.params;
      const storeId = req.params.storeId || req.body.store_id;

      // Verificar se o produto pertence à loja
      const existingProduct = await query(
        'SELECT * FROM products WHERE id = $1 AND store_id = $2',
        [id, storeId]
      );

      if (existingProduct.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      // Construir query dinâmica
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && key !== 'images' && key !== 'store_id') {
          updateFields.push(`${key} = $${paramCount}`);
          updateValues.push(req.body[key]);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo para atualizar'
        });
      }

      updateValues.push(id);

      const productResult = await query(`
        UPDATE products 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `, updateValues);

      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: productResult.rows[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

// DELETE /api/products/:id - Deletar produto
router.delete('/:id',
  authenticate,
  requireStoreOwner,
  requirePermission('manage_products'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const storeId = req.params.storeId || req.query.store_id;

      const productResult = await query(`
        DELETE FROM products 
        WHERE id = $1 AND store_id = $2
        RETURNING *
      `, [id, storeId]);

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Produto deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

export default router;