import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
const destDir = "d:\\website-ban-dthoai\\shopnow\\public\\uploads\\products";

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

// 11 Items to fix with verified active Unsplash Photo IDs
const cleanupMapping = {
  // Corrected slugs and verified active photo IDs
  "huawei-matepad-pro-122": "photo-1544244015-0df4b3ffc6b0", // Tablet
  "ssd-kingston-nv2-1tb-pcie-40-nvme": "photo-1597852074816-d933c7d2b988", // SSD
  "ssd-samsung-990-pro-1tb-pcie-40": "photo-1597852074816-d933c7d2b988", // SSD
  "lg-dualup-28mq780": "photo-1616763355548-1b606f439f86", // Monitor
  "logitech-g-pro-x-superlight-2": "photo-1588872657578-7efd1f1555ed", // Mouse
  "steelseries-apex-pro-tkl": "photo-1618384887929-16ec33fab9ef", // Keyboard
  "jbl-flip-6": "photo-1526738549149-8e07eca6c147", // Speaker
  "o-cam-thong-minh-tuya-wifi-16a": "photo-1485827404703-89b55fcc595e", // Smart plug
  "xiaomi-smart-air-purifier-4": "photo-1558002038-1055907df827", // Smart home device
  "cong-tac-thong-minh-aqara-d1": "photo-1507668077129-56e32842fceb", // Smart switch
  "usb-kingston-datatraveler-exodia-64gb": "photo-1531403009284-440f080d1e12" // USB Flash
};

async function download(slug, imageId) {
  const url = `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=400&h=400&q=80`;
  const filename = `${slug}.jpg`;
  const filepath = join(destDir, filename);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(filepath, buffer);
    console.log(`📥 Downloaded: ${filename}`);
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error(`❌ Failed to download ${slug}:`, error.message);
    return null;
  }
}

async function runCleanup() {
  console.log("=== Bắt đầu sửa lỗi và cập nhật ảnh cho 11 sản phẩm ===");

  const slugs = Object.keys(cleanupMapping);
  let updatedCount = 0;

  for (const slug of slugs) {
    const imageId = cleanupMapping[slug];
    const localUrl = await download(slug, imageId);
    
    if (localUrl) {
      try {
        const product = await prisma.products.findUnique({
          where: { slug }
        });

        if (product) {
          // Xóa ảnh cũ
          await prisma.product_images.deleteMany({
            where: { product_id: product.id }
          });

          // Tạo ảnh mới
          await prisma.product_images.create({
            data: {
              product_id: product.id,
              image_url: localUrl,
              alt_text: product.name,
              sort_order: 1,
              is_primary: true
            }
          });

          // Cập nhật variants
          await prisma.product_variants.updateMany({
            where: { product_id: product.id },
            data: {
              image_url: localUrl
            }
          });

          console.log(`✅ Cập nhật thành công cho: "${product.name}"`);
          updatedCount++;
        } else {
          console.warn(`⚠️ Không tìm thấy sản phẩm có slug: "${slug}"`);
        }
      } catch (dbError) {
        console.error(`❌ Lỗi DB khi cập nhật sản phẩm "${slug}":`, dbError.message);
      }
    }
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n=== Hoàn tất dọn dẹp! Đã sửa thành công ${updatedCount}/${slugs.length} sản phẩm ===`);
}

runCleanup()
  .catch(e => {
    console.error("❌ Lỗi nghiêm trọng:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
