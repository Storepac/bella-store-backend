import { query } from './src/config/database.js';

async function insertCategories() {
  try {
    console.log('🌱 Inserindo categorias de exemplo...');
    
    const categories = [
      {
        name: 'Vestidos',
        description: 'Vestidos femininos elegantes',
        image: 'https://res.cloudinary.com/mkt-img-db/image/upload/v1751579049/samples/ecommerce/leather-bag-gray.jpg',
        slug: 'vestidos',
        storeId: 1,
        isActive: 1
      },
      {
        name: 'Blusas',
        description: 'Blusas femininas confortáveis',
        image: 'https://res.cloudinary.com/mkt-img-db/image/upload/v1751579048/samples/landscapes/architecture-signs.jpg',
        slug: 'blusas',
        storeId: 1,
        isActive: 1
      },
      {
        name: 'Calças',
        description: 'Calças femininas estilosas',
        image: 'https://res.cloudinary.com/mkt-img-db/image/upload/v1751579048/samples/sheep.jpg',
        slug: 'calcas',
        storeId: 1,
        isActive: 1
      },
      {
        name: 'Acessórios',
        description: 'Acessórios femininos',
        image: 'https://res.cloudinary.com/mkt-img-db/image/upload/v1751579048/samples/food/fish-vegetables.jpg',
        slug: 'acessorios',
        storeId: 1,
        isActive: 1
      }
    ];
    
    for (const category of categories) {
      await query(`
        INSERT INTO categories (name, description, image, slug, storeId, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [category.name, category.description, category.image, category.slug, category.storeId, category.isActive]);
      
      console.log(`✅ Categoria "${category.name}" inserida`);
    }
    
    console.log('🎉 Todas as categorias foram inseridas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir categorias:', error.message);
  } finally {
    process.exit(0);
  }
}

insertCategories(); 