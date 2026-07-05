import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const categoryId = "9";
  
  const where = {
    status: "active",
  };

  if (categoryId) {
    where.category_id = BigInt(categoryId);
  }

  console.log("Querying with where:", where);

  const products = await prisma.products.findMany({
    where,
    include: {
      categories: true
    }
  });

  console.log(`Found ${products.length} products for Category ID: ${categoryId}`);
  for (const p of products) {
    console.log(`- ID: ${p.id}, Name: ${p.name}, Category: ${p.categories.name} (ID: ${p.category_id})`);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
