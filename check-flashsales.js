const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const sales = await prisma.flash_sales.findMany();
    console.log('Flash Sales:', sales);
    const products = await prisma.products.findMany({ where: { is_flash_sale: true } });
    console.log('Flash Sale Products:', products.map(p => ({ id: p.id, name: p.name, is_flash_sale: p.is_flash_sale })));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
