// Script tạo tài khoản admin
// Chạy: node scripts/create-admin.js

const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "", // thêm password nếu có
    database: "shopnow",
  });

  const email = "admin@shopnow.com";
  const password = "Admin@123";
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Kiểm tra xem admin đã tồn tại chưa
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      // Cập nhật role thành admin nếu đã tồn tại
      await connection.execute(
        "UPDATE users SET role = 'admin', status = 'active', password_hash = ? WHERE email = ?",
        [passwordHash, email]
      );
      console.log(`✅ Đã cập nhật tài khoản admin: ${email}`);
    } else {
      // Tạo mới
      await connection.execute(
        `INSERT INTO users (full_name, email, password_hash, role, status, created_at, updated_at)
         VALUES (?, ?, ?, 'admin', 'active', NOW(), NOW())`,
        ["Admin ShopNow", email, passwordHash]
      );
      console.log(`✅ Đã tạo tài khoản admin mới: ${email}`);

      // Tạo cart cho admin (nếu bảng carts có NOT NULL constraint)
      const [newUser] = await connection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      if (newUser.length > 0) {
        try {
          await connection.execute(
            "INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())",
            [newUser[0].id]
          );
        } catch {
          // cart có thể không bắt buộc
        }
      }
    }

    console.log("");
    console.log("🔐 Thông tin đăng nhập admin:");
    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${password}`);
    console.log("");
    console.log("🌐 Truy cập trang admin tại: http://localhost:3000/tongquan");
  } finally {
    await connection.end();
  }
}

createAdmin().catch((err) => {
  console.error("❌ Lỗi:", err.message);
  process.exit(1);
});
