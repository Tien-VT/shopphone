// Migration: tạo bảng product_variants
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      product_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(150) NOT NULL,
      sku VARCHAR(100) NULL,
      price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
      old_price DECIMAL(14,2) NULL,
      stock_quantity INT NOT NULL DEFAULT 0,
      color VARCHAR(80) NULL,
      color_hex VARCHAR(10) NULL,
      image_url VARCHAR(500) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      INDEX idx_variants_product_id (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("✅ Bảng product_variants đã được tạo (hoặc đã tồn tại)");
  await prisma.$disconnect();
}

migrate().catch(e => { console.error(e); process.exit(1); });
