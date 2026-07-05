import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma() {
  if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any).product_reviews) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["error"],
    });
  }
  return globalForPrisma.prisma;
}
