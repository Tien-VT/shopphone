// Script tạo tài khoản admin dùng Prisma
// Chạy: node scripts/create-admin.mjs

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "admin@shopnow.com";
  const password = "Admin@123";
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const existing = await prisma.users.findUnique({ where: { email } });

    if (existing) {
      await prisma.users.update({
        where: { email },
        data: { role: "admin", status: "active", password_hash: passwordHash },
      });
      console.log(`✅ Đã cập nhật role admin cho: ${email}`);
    } else {
      const newUser = await prisma.users.create({
        data: {
          full_name: "Admin ShopNow",
          email,
          password_hash: passwordHash,
          role: "admin",
          status: "active",
        },
      });
      // Tạo cart
      try {
        await prisma.carts.create({ data: { user_id: newUser.id } });
      } catch {}
      console.log(`✅ Đã tạo tài khoản admin mới: ${email}`);
    }

    console.log("\n🔐 Thông tin đăng nhập admin:");
    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n🌐 Vào trang admin: http://localhost:3000/tongquan");
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin().catch((e) => {
  console.error("❌ Lỗi:", e.message);
  process.exit(1);
});
