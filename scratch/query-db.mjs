import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Categories ---");
  const categories = await prisma.categories.findMany();
  for (const cat of categories) {
    console.log(`ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}`);
  }

  console.log("\n--- Products Count ---");
  const productsCount = await prisma.products.count();
  console.log(`Total products: ${productsCount}`);

  console.log("\n--- First 10 Products ---");
  const products = await prisma.products.findMany({
    take: 10,
    include: {
      product_images: true,
      product_variants: true,
    }
  });

  for (const prod of products) {
    console.log(`ID: ${prod.id}, Name: ${prod.name}, SKU: ${prod.sku}, Price: ${prod.price}`);
    console.log(`  Images: ${prod.product_images.map(img => img.image_url).join(", ")}`);
    console.log(`  Variants:`);
    for (const v of prod.product_variants) {
      console.log(`    - Name: ${v.name}, SKU: ${v.sku}, Price: ${v.price}, Color: ${v.color}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
