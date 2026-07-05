const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const now = new Date();
    // 2 hours ago
    const start_at = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    // 10 hours from now
    const end_at = new Date(now.getTime() + 10 * 60 * 60 * 1000);

    const updated = await prisma.flash_sales.update({
      where: { id: 1n },
      data: {
        title: 'Flash Sale Lớn Hôm Nay',
        start_at: start_at,
        end_at: end_at,
        status: 'active',
      }
    });

    console.log('Successfully updated flash sale to be active now:', updated);
  } catch (err) {
    console.error('Error updating flash sale:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
