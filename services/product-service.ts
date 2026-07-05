import type { ProductSummary } from "@/types/product";

const featuredProducts: ProductSummary[] = [
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    price: "28.990.000đ",
    oldPrice: "32.990.000đ",
    image: "/giaodienkhachhang/img/banner/ip-1.png",
    description: "Flagship Apple với thiết kế titan và camera cao cấp.",
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    price: "8.690.000đ",
    oldPrice: "9.990.000đ",
    image: "/giaodienkhachhang/img/banner/tainghe-1.png",
    description: "Tai nghe chống ồn chủ động với chất âm cân bằng.",
  },
  {
    id: "macbook-air-m3",
    name: "MacBook Air M3",
    price: "31.990.000đ",
    oldPrice: "35.990.000đ",
    image: "/giaodienkhachhang/img/banner/macbook.png",
    description: "Laptop mỏng nhẹ cho làm việc và học tập di động.",
  },
];

export function getFeaturedProducts() {
  return featuredProducts;
}