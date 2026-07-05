"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";
import { useApp } from "@/lib/app-context";

function getCategoryIcon(slug: string) {
  if (slug.includes("dien-thoai")) return { type: "icon", value: "fa-solid fa-mobile-screen" };
  if (slug.includes("laptop")) return { type: "icon", value: "fa-solid fa-laptop" };
  if (slug.includes("tai-nghe")) return { type: "icon", value: "fa-solid fa-headphones" };
  if (slug.includes("dong-ho")) return { type: "image", value: "/icontrangchu/smart-watch.png" };
  if (slug.includes("phu-kien")) return { type: "image", value: "/icontrangchu/3d-print.png" };
  if (slug.includes("may-tinh-bang")) return { type: "icon", value: "fa-solid fa-tablet-screen-button" };
  if (slug.includes("man-hinh-may-tinh")) return { type: "icon", value: "fa-solid fa-desktop" };
  if (slug.includes("ban-phim-chuot")) return { type: "icon", value: "fa-solid fa-keyboard" };
  if (slug.includes("loa-am-thanh")) return { type: "icon", value: "fa-solid fa-volume-high" };
  if (slug.includes("nha-thong-minh")) return { type: "icon", value: "fa-solid fa-house-laptop" };
  if (slug.includes("may-anh")) return { type: "icon", value: "fa-solid fa-camera" };
  if (slug.includes("thiet-bi-luu-tru")) return { type: "icon", value: "fa-solid fa-database" };
  return { type: "icon", value: "fa-solid fa-microchip" };
}

export function CustomerProductListPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("popular");

  const { addToCart, toggleWishlist, isInWishlist, openAuthModal, user } = useApp();

  // Read URL params on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCategoryFilter(params.get("category") || "");
      setSearchQuery(params.get("search") || "");
    }
  }, []);

  // Listen for custom address-bar changes manually or window history state updates
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setCategoryFilter(params.get("category") || "");
      setSearchQuery(params.get("search") || "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data || []))
      .catch((err) => console.error("Error categories:", err));
  }, []);

  // Fetch products
  useEffect(() => {
    let url = `/api/products?`;
    if (categoryFilter) url += `category=${categoryFilter}&`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (sort && sort !== "popular") url += `sort=${sort}&`;

    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.items || []);
      })
      .catch((err) => console.error("Error products:", err))
      .finally(() => setLoading(false));
  }, [categoryFilter, searchQuery, sort]);

  const selectCategory = (id: string) => {
    setCategoryFilter(id);
    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set("category", id);
    } else {
      params.delete("category");
    }
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "Giá thấp đến cao") setSort("low-to-high");
    else if (val === "Giá cao đến thấp") setSort("high-to-low");
    else if (val === "Mới nhất") setSort("newest");
    else setSort("popular");
  };

  const addDbProductToCart = (product: any) => {
    let price = Number(product.price);
    let originalPrice = product.old_price ? Number(product.old_price) : price;
    if (product.is_flash_sale && product.flash_sale_discount_percent) {
      originalPrice = price;
      price = price * (1 - product.flash_sale_discount_percent / 100);
    }
    addToCart({
      id: Number(product.id),
      name: product.name,
      category: product.categories?.name || "Sản phẩm",
      variant: "Mặc định",
      price,
      originalPrice,
      image: product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png",
    });
  };

  const handleDbWishlist = (product: any) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    let price = Number(product.price);
    let originalPrice = product.old_price ? Number(product.old_price) : price;
    if (product.is_flash_sale && product.flash_sale_discount_percent) {
      originalPrice = price;
      price = price * (1 - product.flash_sale_discount_percent / 100);
    }
    toggleWishlist({
      id: Number(product.id),
      name: product.name,
      category: product.categories?.name || "Sản phẩm",
      price,
      originalPrice,
      image: product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png",
      rating: 5,
      reviews: 99,
    });
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + "đ";
  };

  const activeCategory = categories.find((c) => String(c.id) === String(categoryFilter));

  return (
    <CustomerShell>
      <div className="max-w-[1280px] mx-auto px-4 py-5">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-[240px] shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm self-start">
            <div className="px-4 py-3 bg-brand-purple/5 border-b border-gray-100 font-bold text-[14px] text-brand-purple">
              DANH MỤC
            </div>
            <ul className="text-[13px] text-gray-700 divide-y divide-gray-50">
              <li>
                <button
                  onClick={() => selectCategory("")}
                  className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 text-left transition-all ${
                    !categoryFilter ? "bg-purple-50 text-brand-purple font-bold" : ""
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <i className="fa-solid fa-list-ul w-4 text-center"></i>
                    Tất cả sản phẩm
                  </span>
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => selectCategory(String(cat.id))}
                    className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 text-left transition-all ${
                      String(cat.id) === String(categoryFilter)
                        ? "bg-purple-50 text-brand-purple font-bold"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {(() => {
                        const isActive = String(cat.id) === String(categoryFilter);
                        if (cat.icon && (cat.icon.startsWith("/") || cat.icon.startsWith("http"))) {
                          return (
                            <img
                              src={cat.icon}
                              className={`w-4 h-4 object-contain ${isActive ? "opacity-100 font-bold" : "opacity-60"} transition-all text-center`}
                              alt={cat.name}
                            />
                          );
                        }
                        const iconConfig = getCategoryIcon(cat.slug);
                        return iconConfig.type === "image" ? (
                          <img
                            src={iconConfig.value}
                            className={`w-4 h-4 object-contain ${isActive ? "opacity-100 font-bold" : "opacity-60"} transition-all text-center`}
                            alt={cat.name}
                          />
                        ) : (
                          <i className={`${iconConfig.value} w-4 text-center`}></i>
                        );
                      })()}
                      {cat.name}
                    </span>
                    <i className="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Content */}
          <div className="flex-grow">
            {/* Breadcrumb info */}
            <div className="mb-4 text-xs text-gray-500">
              <Link href="/trangchu" className="hover:text-brand-purple">Trang chủ</Link>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-700 font-medium">
                {activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
              </span>
              {searchQuery && (
                <>
                  <span className="mx-2">&gt;</span>
                  <span>Tìm kiếm: &quot;{searchQuery}&quot;</span>
                </>
              )}
            </div>

            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-600 text-sm">
                Hiển thị <span className="font-semibold text-gray-900">{products.length}</span> sản phẩm
              </p>
              <select
                onChange={handleSortChange}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-purple bg-white text-gray-700"
              >
                <option>Phổ biến nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
                <option>Mới nhất</option>
              </select>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                <i className="fa-solid fa-spinner fa-spin text-brand-purple text-[30px] mb-3"></i>
                <p className="text-gray-500 text-sm">Đang tải sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <i className="fa-regular fa-folder-open text-gray-300 text-[60px] mb-4"></i>
                <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào phù hợp.</p>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  let price = Number(product.price);
                  let oldPrice = 0;
                  let discount = "";

                  if (product.is_flash_sale && product.flash_sale_discount_percent) {
                    oldPrice = price;
                    price = price * (1 - product.flash_sale_discount_percent / 100);
                    discount = `-${product.flash_sale_discount_percent}%`;
                  } else if (product.old_price) {
                    oldPrice = Number(product.old_price);
                    discount = `-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`;
                  }
                  const imgUrl = product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png";

                  return (
                    <div
                      key={product.id}
                      className="product-card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="relative">
                        <Link href={`/chitietsanpham?slug=${product.slug}`}>
                          <div className="h-48 flex items-center justify-center p-4 bg-gray-50 overflow-hidden">
                            <img
                              src={imgUrl}
                              className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              alt={product.name}
                            />
                          </div>
                        </Link>
                        {discount && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                            {discount}
                          </span>
                        )}
                        <button
                          onClick={() => handleDbWishlist(product)}
                          className={`absolute top-3 right-3 z-10 transition-colors ${
                            isInWishlist(Number(product.id)) ? "text-red-500" : "text-gray-300 hover:text-red-500"
                          }`}
                        >
                          <i className={`${isInWishlist(Number(product.id)) ? "fa-solid" : "fa-regular"} fa-heart text-[16px]`}></i>
                        </button>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-brand-purple uppercase mb-1">
                            {product.categories?.name || "Sản phẩm"}
                          </p>
                          <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-800 h-10">
                            <Link href={`/chitietsanpham?slug=${product.slug}`} className="hover:text-brand-purple">
                              {product.name}
                            </Link>
                          </h4>
                          <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span className="text-gray-400 ml-1 text-[11px]">(99)</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-lg text-brand-purple">
                              {formatCurrency(price)}
                            </span>
                            {oldPrice > 0 && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatCurrency(oldPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => addDbProductToCart(product)}
                            className="mt-4 w-full bg-brand-purple text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                          >
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}
