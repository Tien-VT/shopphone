"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

export function CustomerWishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch all categories from API
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Lỗi fetch categories:", err));
  }, []);

  // Compute stats for wishlist items count per category
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    wishlist.forEach((item) => {
      const cat = item.category || "Khác";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [wishlist]);

  // Filtered list based on selected category
  const filteredWishlist = useMemo(() => {
    if (!selectedCategory) return wishlist;
    return wishlist.filter((item) => (item.category || "Khác") === selectedCategory);
  }, [wishlist, selectedCategory]);

  return (
    <CustomerShell>
      <div className="max-w-[1280px] mx-auto px-4 py-5">
        <div className="flex gap-5 items-stretch">
          {/* Sidebar */}
          <aside className="w-[240px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm h-fit">
            <h3 className="font-bold text-gray-800 text-[14px] mb-4 flex items-center gap-2">
              <i className="fa-solid fa-list text-brand-purple"></i> DANH MỤC YÊU THÍCH
            </h3>
            <ul className="space-y-1 text-[13px]">
              {/* Tất cả */}
              <li
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                  selectedCategory === null
                    ? "bg-purple-50 text-brand-purple font-bold border border-brand-purple/20"
                    : "hover:bg-gray-50 text-gray-600 border border-transparent"
                }`}
              >
                <span className="flex items-center gap-3">
                  <i className="fa-solid fa-border-all w-5 text-center text-[15px]"></i>
                  Tất cả sản phẩm
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-500">
                  {wishlist.length}
                </span>
              </li>

              {/* Dynamic categories fetched from API */}
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.name;
                const count = categoryCounts[cat.name] || 0;
                
                let iconClass = "fa-solid fa-box";
                const catNameLower = cat.name.toLowerCase();
                if (catNameLower.includes("thoại") || catNameLower.includes("phone")) {
                  iconClass = "fa-solid fa-mobile-screen";
                } else if (catNameLower.includes("laptop") || catNameLower.includes("máy tính")) {
                  iconClass = "fa-solid fa-laptop";
                } else if (catNameLower.includes("phụ kiện") || catNameLower.includes("tai nghe") || catNameLower.includes("cáp") || catNameLower.includes("chuột") || catNameLower.includes("bàn phím")) {
                  iconClass = "fa-solid fa-headphones";
                } else if (catNameLower.includes("tablet") || catNameLower.includes("ipad")) {
                  iconClass = "fa-solid fa-tablet-screen-button";
                } else if (catNameLower.includes("gia dụng") || catNameLower.includes("bếp") || catNameLower.includes("quạt")) {
                  iconClass = "fa-solid fa-blender";
                }

                return (
                  <li
                    key={cat.id.toString()}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-purple-50 text-brand-purple font-bold border border-brand-purple/20"
                        : "hover:bg-gray-50 text-gray-600 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <i className={`${iconClass} w-5 text-center text-[15px]`}></i>
                      {cat.name}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${count > 0 ? "bg-purple-100 text-[#4f22d6]" : "bg-gray-100 text-gray-500"}`}>
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="mb-6">
              <h1 className="text-[28px] font-bold text-gray-900">Sản phẩm yêu thích</h1>
              <p className="text-gray-500 mt-1">
                Bạn đang có <span className="font-semibold text-brand-purple">{filteredWishlist.length} sản phẩm</span> {selectedCategory ? `thuộc nhóm "${selectedCategory}"` : ""} trong danh sách yêu thích
              </p>
            </div>

            {wishlist.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <i className="fa-regular fa-heart text-gray-300 text-[60px] mb-4 block"></i>
                <p className="text-gray-500 mb-4">Danh sách yêu thích của bạn trống.</p>
                <Link href="/sanpham" className="bg-brand-purple text-white px-6 py-2.5 rounded-lg font-bold">
                  Mua sắm ngay
                </Link>
              </div>
            ) : filteredWishlist.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <i className="fa-solid fa-box-open text-gray-300 text-[60px] mb-4 block"></i>
                <p className="text-gray-500 mb-4">Không có sản phẩm yêu thích nào trong danh mục này.</p>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredWishlist.map((product) => (
                  <div key={product.id.toString()} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
                    <div className="relative">
                      <Link href={`/chitietsanpham?slug=${product.id}`}>
                        <img src={product.image} className="w-full h-48 object-contain p-4 bg-gray-50/20 group-hover:scale-102 transition-transform" alt={product.name} />
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <i className="fa-solid fa-heart"></i>
                      </button>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                          <Link href={`/chitietsanpham?slug=${product.id}`} className="hover:text-brand-purple">{product.name}</Link>
                        </h4>
                        <p className="text-brand-purple font-bold text-lg">{Number(product.price).toLocaleString("vi-VN")}đ</p>
                      </div>
                      <button
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          variant: "Mặc định",
                          price: product.price,
                          originalPrice: product.originalPrice || product.price,
                          image: product.image,
                        })}
                        className="mt-3 w-full bg-brand-purple text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}
