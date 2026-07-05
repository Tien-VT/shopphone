import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const vouchers = await prisma.vouchers.findMany();
  console.log("Current vouchers in DB:", vouchers);
}
run().finally(() => prisma.$disconnect());
