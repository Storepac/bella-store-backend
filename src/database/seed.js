import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuário admin master
    const adminPassword = await bcrypt.hash('masteradmin123', 12);
    
    const adminUser = await query(`
      INSERT INTO users (name, email, password_hash, role, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified
      RETURNING id
    `, [
      'Admin Master',
      'admin@master.com',
      adminPassword,
      'admin_master',
      true,
      true
    ]);

    const adminUserId = adminUser.rows[0].id;

    // Criar registro na tabela admin_users
    await query(`
      INSERT INTO admin_users (user_id, permissions)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET
        permissions = EXCLUDED.permissions
    `, [
      adminUserId,
      JSON.stringify({
        manage_stores: true,
        manage_users: true,
        view_analytics: true,
        system_settings: true
      })
    ]);

    // Criar loja de exemplo
    const store = await query(`
      INSERT INTO stores (
        store_code, store_name, store_description, whatsapp_number,
        email, address, city, state, zip_code, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (store_code) DO UPDATE SET
        store_name = EXCLUDED.store_name,
        store_description = EXCLUDED.store_description,
        whatsapp_number = EXCLUDED.whatsapp_number,
        email = EXCLUDED.email
      RETURNING id
    `, [
      'BELLA001',
      'Bella Store',
      'Loja de moda feminina com as últimas tendências',
      '5511999999999',
      'contato@bellastore.com',
      'Rua das Flores, 123',
      'São Paulo',
      'SP',
      '01234-567',
      adminUserId
    ]);

    const storeId = store.rows[0].id;

    // Criar usuário da loja
    const storeOwnerPassword = await bcrypt.hash('bellastore123', 12);
    
    const storeOwner = await query(`
      INSERT INTO users (name, email, password_hash, role, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        email_verified = EXCLUDED.email_verified
      RETURNING id
    `, [
      'Administrador Bella Store',
      'admin@bellastore.com',
      storeOwnerPassword,
      'store_owner',
      true,
      true
    ]);

    const storeOwnerId = storeOwner.rows[0].id;

    // Associar usuário à loja
    await query(`
      INSERT INTO store_users (user_id, store_id, permissions)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id) DO UPDATE SET
        permissions = EXCLUDED.permissions
    `, [
      storeOwnerId,
      storeId,
      JSON.stringify({
        manage_products: true,
        manage_orders: true,
        manage_categories: true,
        manage_banners: true,
        view_analytics: true
      })
    ]);

    // Criar categorias de exemplo
    const categories = [
      { name: 'Vestidos', slug: 'vestidos', description: 'Vestidos elegantes para todas as ocasiões' },
      { name: 'Blusas', slug: 'blusas', description: 'Blusas modernas e confortáveis' },
      { name: 'Calças', slug: 'calcas', description: 'Calças de diversos estilos' },
      { name: 'Sapatos', slug: 'sapatos', description: 'Calçados para todos os momentos' },
      { name: 'Acessórios', slug: 'acessorios', description: 'Acessórios para completar o look' }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const result = await query(`
        INSERT INTO categories (store_id, name, slug, description, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (store_id, slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description
        RETURNING id
      `, [storeId, category.name, category.slug, category.description, true, 0]);
      
      categoryIds[category.slug] = result.rows[0].id;
    }

    // Criar produtos de exemplo
    const products = [
      {
        name: 'Vestido Midi Floral',
        description: 'Lindo vestido midi com estampa floral delicada, perfeito para ocasiões especiais',
        short_description: 'Vestido midi floral elegante',
        price: 89.90,
        compare_price: 129.90,
        category: 'vestidos',
        sku: 'VEST001',
        stock: 15
      },
      {
        name: 'Blusa de Seda Premium',
        description: 'Blusa elegante de seda natural, ideal para o trabalho ou eventos sociais',
        short_description: 'Blusa de seda natural',
        price: 65.00,
        compare_price: 89.90,
        category: 'blusas',
        sku: 'BLUS001',
        stock: 25
      },
      {
        name: 'Calça Jeans Skinny',
        description: 'Calça jeans skinny de alta qualidade, confortável e moderna',
        short_description: 'Calça jeans skinny',
        price: 79.90,
        category: 'calcas',
        sku: 'CALC001',
        stock: 30
      }
    ];

    for (const product of products) {
      await query(`
        INSERT INTO products (
          store_id, category_id, name, description, short_description,
          price, compare_price, sku, stock_quantity, status, is_featured
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (sku) DO NOTHING
      `, [
        storeId,
        categoryIds[product.category],
        product.name,
        product.description,
        product.short_description,
        product.price,
        product.compare_price,
        product.sku,
        product.stock,
        'active',
        true
      ]);
    }

    // Criar banners de exemplo
    const banners = [
      {
        title: 'Coleção Primavera/Verão',
        subtitle: 'Descubra as últimas tendências da moda',
        position: 'hero',
        button_text: 'Ver Coleção'
      },
      {
        title: 'Promoção Especial',
        subtitle: 'Até 50% de desconto em peças selecionadas',
        position: 'middle',
        button_text: 'Aproveitar'
      }
    ];

    for (const banner of banners) {
      await query(`
        INSERT INTO banners (store_id, title, subtitle, position, button_text, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        storeId,
        banner.title,
        banner.subtitle,
        banner.position,
        banner.button_text,
        true,
        0
      ]);
    }

    console.log('✅ Seed executado com sucesso!');
    console.log('📧 Admin Master: admin@master.com / masteradmin123');
    console.log('🏪 Loja Bella: admin@bellastore.com / bellastore123');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;