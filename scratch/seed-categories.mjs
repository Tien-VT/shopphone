import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const newCategories = [
  {
    name: "Máy tính bảng",
    slug: "may-tinh-bang",
    icon: "tablet_mac",
    sort_order: 6,
  },
  {
    name: "Màn hình máy tính",
    slug: "man-hinh-may-tinh",
    icon: "monitor",
    sort_order: 7,
  },
  {
    name: "Bàn phím & Chuột",
    slug: "ban-phim-chuot",
    icon: "keyboard",
    sort_order: 8,
  },
  {
    name: "Loa & Âm thanh",
    slug: "loa-am-thanh",
    icon: "speaker",
    sort_order: 9,
  },
  {
    name: "Thiết bị nhà thông minh",
    slug: "nha-thong-minh",
    icon: "home",
    sort_order: 10,
  },
  {
    name: "Máy ảnh & Máy quay",
    slug: "may-anh",
    icon: "photo_camera",
    sort_order: 11,
  },
  {
    name: "Thiết bị lưu trữ",
    slug: "thiet-bi-luu-tru",
    icon: "storage",
    sort_order: 12,
  }
];

async function seed() {
  console.log("=== Bắt đầu thêm danh mục mới ===");
  
  for (const cat of newCategories) {
    try {
      const existing = await prisma.categories.findUnique({
        where: { slug: cat.slug }
      });

      if (existing) {
        // Cập nhật nếu đã tồn tại
        const updated = await prisma.categories.update({
          where: { id: existing.id },
          data: {
            name: cat.name,
            icon: cat.icon,
            sort_order: cat.sort_order,
            is_active: true
          }
        });
        console.log(`🔄 Đã cập nhật danh mục: "${updated.name}" (ID: ${updated.id})`);
      } else {
        // Tạo mới
        const created = await prisma.categories.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            sort_order: cat.sort_order,
            is_active: true
          }
        });
        console.log(`✅ Đã tạo danh mục mới: "${created.name}" (ID: ${created.id})`);
      }
    } catch (error) {
      console.error(`❌ Lỗi khi thêm danh mục "${cat.name}":`, error);
    }
  }

  console.log("\n=== Hoàn tất Seeding Danh Mục! ===");
}

seed()
  .catch(e => {
    console.error("❌ Lỗi nghiêm trọng:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
