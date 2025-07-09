-- =========================
-- TABELA: stores (lojas)
-- =========================
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    description TEXT,
    cnpj VARCHAR(30),
    inscricao_estadual VARCHAR(30),
    whatsapp VARCHAR(30),
    email VARCHAR(100),
    endereco VARCHAR(255),
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    youtube VARCHAR(100),
    horarios VARCHAR(255),
    politicas_troca TEXT,
    politicas_gerais TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- TABELA: users (admin/master)
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin_master', 'admin_loja') DEFAULT 'admin_loja',
    storeId INT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE SET NULL
);

-- =========================
-- TABELA: settings (configurações da loja)
-- =========================
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    storeId INT NOT NULL,
    moeda VARCHAR(10) DEFAULT 'BRL',
    fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    plano ENUM('Start', 'Pro', 'Max') DEFAULT 'Start',
    data_expiracao_plano DATE,
    status_pagamento ENUM('ativo', 'pendente', 'bloqueado') DEFAULT 'ativo',
    limite_produtos INT DEFAULT 500,
    limite_fotos_produto INT DEFAULT 2,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: appearance (aparência do site)
-- =========================
CREATE TABLE appearance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    storeId INT NOT NULL,
    cor_primaria VARCHAR(20),
    cor_secundaria VARCHAR(20),
    cor_botoes VARCHAR(20),
    fonte VARCHAR(50),
    outras_opcoes JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: categories (categorias)
-- =========================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parentId INT,
    level INT DEFAULT 0,
    display JSON,
    seo JSON,
    slug VARCHAR(120) UNIQUE,
    productCount INT DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    `order` INT DEFAULT 0,
    storeId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: products (produtos)
-- =========================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    categoryId INT,
    brand VARCHAR(100),
    status ENUM('ativo', 'novo', 'lancamento', 'promocao', 'arquivado', 'rascunho') DEFAULT 'ativo',
    isFeatured BOOLEAN DEFAULT FALSE,
    isPromotion BOOLEAN DEFAULT FALSE,
    isLaunch BOOLEAN DEFAULT FALSE,
    stock INT,
    storeId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: product_media (imagens e vídeos dos produtos)
-- =========================
CREATE TABLE product_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    type ENUM('image', 'video') DEFAULT 'image',
    size INT,
    width INT,
    height INT,
    isMain BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0,
    public_id VARCHAR(150),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: product_variants (variações de produto)
-- =========================
CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    color VARCHAR(50),
    size VARCHAR(50),
    sku VARCHAR(50),
    stock INT,
    price DECIMAL(10,2),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: variant_options (opções de variação)
-- =========================
CREATE TABLE variant_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    type ENUM('color', 'size') NOT NULL,
    value VARCHAR(50) NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: kits (kits/combo de produtos)
-- =========================
CREATE TABLE kits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    categoryId INT,
    isActive BOOLEAN DEFAULT TRUE,
    storeId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: kit_products (relacionamento kit-produto)
-- =========================
CREATE TABLE kit_products (
    kitId INT NOT NULL,
    productId INT NOT NULL,
    quantidade INT DEFAULT 1,
    PRIMARY KEY (kitId, productId),
    FOREIGN KEY (kitId) REFERENCES kits(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: banners
-- =========================
CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    link VARCHAR(255),
    buttonText VARCHAR(50),
    position VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    categoryId INT,
    storeId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: coupons (cupons)
-- =========================
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
    discount_type ENUM('percent', 'fixed', 'free_shipping') DEFAULT 'percent',
    discount_value DECIMAL(10,2),
    min_order_value DECIMAL(10,2),
    max_uses INT,
    uses INT DEFAULT 0,
    expires_at DATE,
    isActive BOOLEAN DEFAULT TRUE,
    storeId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: clients (clientes)
-- =========================
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    whatsapp VARCHAR(30),
    email VARCHAR(100),
    endereco VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    storeId INT NOT NULL,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: orders (pedidos)
-- =========================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clientId INT,
    storeId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pix', 'cartao', 'boleto', 'condicional', 'outro') DEFAULT 'pix',
    valor_total DECIMAL(10,2),
    condicional BOOLEAN DEFAULT FALSE,
    data_condicional DATE,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: orders_products (relacionamento pedido-produto)
-- =========================
CREATE TABLE orders_products (
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantidade INT DEFAULT 1,
    preco_unitario DECIMAL(10,2),
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: notifications (notificações)
-- =========================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    storeId INT NOT NULL,
    clientId INT,
    whatsapp VARCHAR(30),
    arquivo VARCHAR(255),
    mensagem TEXT,
    enviado_em DATETIME,
    status VARCHAR(30),
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE SET NULL
);

-- =========================
-- TABELA: reports (relatórios)
-- =========================
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    storeId INT NOT NULL,
    tipo VARCHAR(50),
    periodo VARCHAR(50),
    dados JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
);