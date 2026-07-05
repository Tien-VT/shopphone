-- ShopNow MySQL schema
-- Import this file into MySQL 8.x

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS shopnow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shopnow;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS flash_sales;
DROP TABLE IF EXISTS news_articles;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'locked', 'pending') NOT NULL DEFAULT 'active',
  loyalty_tier ENUM('bronze', 'silver', 'gold', 'diamond') NOT NULL DEFAULT 'bronze',
  avatar_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  icon VARCHAR(120) NULL,
  parent_id BIGINT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent_id (parent_id),
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  short_description VARCHAR(500) NULL,
  description TEXT NULL,
  price DECIMAL(14,2) NOT NULL DEFAULT 0,
  old_price DECIMAL(14,2) NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_flash_sale TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('draft', 'active', 'hidden') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  UNIQUE KEY uq_products_sku (sku),
  KEY idx_products_category_id (category_id),
  KEY idx_products_status (status),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_images_product_id (product_id),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_carts_user_id (user_id),
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_items_cart_product (cart_id, product_id),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  recipient_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  ward VARCHAR(120) NULL,
  district VARCHAR(120) NULL,
  province VARCHAR(120) NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_addresses_user_id (user_id),
  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE vouchers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  discount_type ENUM('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(14,2) NOT NULL DEFAULT 0,
  minimum_order_value DECIMAL(14,2) NOT NULL DEFAULT 0,
  max_discount_value DECIMAL(14,2) NULL,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive', 'expired') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vouchers_code (code)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_code VARCHAR(50) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  address_id BIGINT UNSIGNED NULL,
  voucher_id BIGINT UNSIGNED NULL,
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  payment_method ENUM('cod', 'bank_transfer', 'momo', 'card') NOT NULL DEFAULT 'cod',
  payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  order_status ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_code (order_code),
  KEY idx_orders_user_id (user_id),
  KEY idx_orders_status (order_status),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_address
    FOREIGN KEY (address_id) REFERENCES addresses(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_voucher
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE favorites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites_user_product (user_id, product_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_favorites_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE flash_sales (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description VARCHAR(500) NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  status ENUM('scheduled', 'active', 'ended', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_flash_sales_slug (slug),
  KEY idx_flash_sales_status (status)
) ENGINE=InnoDB;

CREATE TABLE news_articles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt VARCHAR(500) NULL,
    content TEXT NULL,
  thumbnail_url VARCHAR(500) NULL,
  author_user_id BIGINT UNSIGNED NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_articles_slug (slug),
  KEY idx_news_articles_author_user_id (author_user_id),
  CONSTRAINT fk_news_articles_author
    FOREIGN KEY (author_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

SET foreign_key_checks = 1;

INSERT INTO users (full_name, email, password_hash, phone, role, status, loyalty_tier)
VALUES
  ('Admin ShopNow', 'admin@shopnow.vn', '$2b$10$replace-this-with-real-hash', '0900000000', 'admin', 'active', 'diamond'),
  ('Nguyễn Văn An', 'an.nguyen@email.com', '$2b$10$replace-this-with-real-hash', '0901234567', 'customer', 'active', 'diamond');

INSERT INTO categories (name, slug, icon, sort_order)
VALUES
  ('Điện thoại', 'dien-thoai', 'smartphone', 1),
  ('Laptop', 'laptop', 'laptop_mac', 2),
  ('Tai nghe', 'tai-nghe', 'headphones', 3),
  ('Đồng hồ', 'dong-ho', 'watch', 4),
  ('Phụ kiện', 'phu-kien', 'devices_other', 5);

INSERT INTO products (category_id, name, slug, sku, short_description, description, price, old_price, stock_quantity, is_featured, is_flash_sale, status)
VALUES
  (1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'IP15PM-256-TITAN', 'Flagship Apple cao cấp', 'Thiết kế titan, camera mạnh mẽ và hiệu năng dẫn đầu.', 28990000, 32990000, 12, 1, 0, 'active'),
  (1, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'SSS24U-256-BLK', 'Điện thoại Android cao cấp', 'Màn hình lớn, S Pen và camera zoom mạnh.', 25490000, 29990000, 8, 1, 1, 'active'),
  (2, 'MacBook Air M3', 'macbook-air-m3', 'MBA-M3-16-512', 'Laptop mỏng nhẹ', 'Hiệu năng mạnh, pin dài và thiết kế sang trọng.', 31990000, 35990000, 6, 1, 0, 'active'),
  (3, 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'SONY-XM5-BLK', 'Tai nghe chống ồn', 'Âm thanh cân bằng, chống ồn chủ động, pin lâu.', 8690000, 9990000, 15, 1, 1, 'active');

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
VALUES
  (1, '/giaodienkhachhang/img/banner/iphone.png', 'iPhone 15 Pro Max', 1, 1),
  (2, '/giaodienkhachhang/img/banner/samsung.jpg', 'Samsung Galaxy S24 Ultra', 1, 1),
  (3, '/giaodienkhachhang/img/banner/macbook.png', 'MacBook Air M3', 1, 1),
  (4, '/giaodienkhachhang/img/banner/tainghe-1.png', 'Sony WH-1000XM5', 1, 1);

INSERT INTO vouchers (code, name, description, discount_type, discount_value, minimum_order_value, max_discount_value, status)
VALUES
  ('WELCOME10', 'Voucher chào mừng', 'Giảm giá cho khách hàng mới.', 'percent', 10, 500000, 300000, 'active'),
  ('FREESHIP', 'Miễn phí vận chuyển', 'Áp dụng cho đơn từ 499k.', 'fixed', 30000, 499000, 30000, 'active'),
  ('SALE50', 'Sale đặc biệt', 'Ưu đãi cho chiến dịch flash sale.', 'percent', 50, 2000000, 500000, 'active');

INSERT INTO flash_sales (title, slug, description, start_at, end_at, status)
VALUES
  ('Flash Sale iPhone', 'flash-sale-iphone', 'Ưu đãi iPhone trong khung giờ vàng.', '2026-07-02 08:00:00', '2026-07-02 23:59:59', 'active');

INSERT INTO news_articles (title, slug, excerpt, content, author_user_id, status, published_at)
VALUES
  ('Xu hướng smartphone 2026', 'xu-huong-smartphone-2026', 'Những đổi mới đáng chú ý trong năm 2026.', 'Bài viết giới thiệu xu hướng smartphone nổi bật.', 1, 'published', NOW());