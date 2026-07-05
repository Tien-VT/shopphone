import { getFeaturedProducts } from "@/services/product-service";

export function listProducts() {
  return getFeaturedProducts();
}