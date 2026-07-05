const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  console.log("=== USERS IN DB ===");
  users.forEach(u => {
    console.log(`ID: ${u.id.toString()} | Email: ${u.email} | Name: ${u.full_name} | Role: ${u.role}`);
  });

  const orders = await prisma.orders.findMany();
  console.log("\n=== ORDERS IN DB ===");
  orders.forEach(o => {
    console.log(`ID: ${o.id.toString()} | Code: ${o.order_code} | UserID: ${o.user_id.toString()} | Total: ${o.total_amount} | Status: ${o.order_status}`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
