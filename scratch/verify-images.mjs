import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("=== Bắt đầu kiểm tra tính độc bản của ảnh ===");
  
  const products = await prisma.products.findMany({
    where: {
      category_id: {
        in: [6n, 7n, 8n, 9n, 10n, 11n, 12n]
      }
    },
    include: {
      product_images: true,
      categories: true
    }
  });

  const imageCounts = {};
  const duplicateList = [];

  for (const prod of products) {
    const mainImg = prod.product_images?.[0]?.image_url;
    if (!mainImg) {
      console.error(`❌ Sản phẩm "${prod.name}" (ID: ${prod.id}) không có ảnh!`);
      continue;
    }

    if (imageCounts[mainImg]) {
      imageCounts[mainImg].push(prod.name);
    } else {
      imageCounts[mainImg] = [prod.name];
    }
  }

  console.log(`\nTổng số sản phẩm kiểm tra: ${products.length}`);
  
  let duplicatesFound = false;
  for (const [img, names] of Object.entries(imageCounts)) {
    if (names.length > 1) {
      duplicatesFound = true;
      console.warn(`⚠️ Ảnh trùng lặp: "${img}" đang được dùng bởi:`);
      for (const name of names) {
        console.warn(`   - ${name}`);
      }
    }
  }

  if (!duplicatesFound) {
    console.log("✅ TUYỆT VỜI! Tất cả các sản phẩm đều đang sử dụng ảnh độc bản và không bị trùng lặp!");
  } else {
    console.warn("⚠️ Có một vài sản phẩm đang dùng chung ảnh.");
  }
}

verify()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
