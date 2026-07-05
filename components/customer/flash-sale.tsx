"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";

const goldenHours = [
  { time: "09:00 - 12:00", label: "Đã kết thúc", icon: "fa-solid fa-circle-check text-gray-300", status: "ended" },
  { time: "12:00 - 15:00", label: "Đang diễn ra", icon: "fa-solid fa-fire text-red-500", status: "active" },
  { time: "15:00 - 18:00", label: "Sắp diễn ra", icon: "fa-solid fa-clock text-gray-400", status: "upcoming" },
  { time: "18:00 - 21:00", label: "Sắp diễn ra", icon: "fa-solid fa-clock text-gray-400", status: "upcoming" },
  { time: "21:00 - 24:00", label: "Sắp diễn ra", icon: "fa-solid fa-clock text-gray-400", status: "upcoming" },
];

export function CustomerFlashSalePage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saleTitle, setSaleTitle] = useState("Ưu đãi chớp nhoáng hôm nay");

  useEffect(() => {
    fetch("/api/flashsales")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
        
        const activeSale = data.sales?.find((s: any) => {
          const now = new Date().getTime();
          const start = new Date(s.start_at).getTime();
          const end = new Date(s.end_at).getTime();
          return s.status === "active" && now >= start && now <= end;
        }) || data.sales?.[0];

        if (activeSale) {
          setSaleTitle(activeSale.title);
          const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(activeSale.end_at).getTime();
            const diff = end - now;
            if (diff > 0) {
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              setTimeLeft({ hours, minutes, seconds });
            } else {
              setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
          };
          updateTimer();
          const interval = setInterval(updateTimer, 1000);
          setLoading(false);
          return () => clearInterval(interval);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi load flash sale:", err);
        setLoading(false);
      });
  }, []);

  return (
    <CustomerShell>
      <div className="max-w-[1280px] mx-auto px-4 py-5">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-[240px] shrink-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm h-fit">
            <h3 className="font-bold text-gray-800 text-[14px] mb-4 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-500"></i> KHUNG GIỜ VÀNG
            </h3>
            <ul className="space-y-2 text-[13px]">
              {goldenHours.map((hour) => (
                <li
                  key={hour.time}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    hour.status === "active"
                      ? "border-[#4f22d6] bg-purple-50/50 text-[#4f22d6] font-bold shadow-sm"
                      : "border-gray-100 hover:border-gray-200 text-gray-600 bg-gray-50/30"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] uppercase font-bold tracking-wide">{hour.time}</span>
                    <i className={hour.icon}></i>
                  </div>
                  <span className={`text-[10px] ${hour.status === "active" ? "text-red-500 font-bold" : "text-gray-400"}`}>
                    {hour.label}
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Flash Sale Content */}
          <div className="flex-grow">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#4f22d6] to-[#6b42f4] rounded-2xl p-8 mb-10 text-white relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <span className="inline-block bg-red-500 px-4 py-1 rounded-full text-xs font-bold mb-3">
                    FLASH SALE - KẾT THÚC SỚM
                  </span>
                  <h1 className="text-4xl font-bold mb-2">{saleTitle}</h1>
                  <p className="text-lg opacity-90">Giảm giá chớp nhoáng từ hệ thống</p>
                </div>

                {/* Countdown */}
                <div className="bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl px-8 py-5 shadow-lg flex gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, "0")}</div>
                    <div className="text-[10px] font-bold text-gray-500">GIỜ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, "0")}</div>
                    <div className="text-[10px] font-bold text-gray-500">PHÚT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, "0")}</div>
                    <div className="text-[10px] font-bold text-gray-500">GIÂY</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-20">
                <i className="fa-solid fa-spinner fa-spin text-[30px] text-brand-purple mb-3" />
                <p className="text-gray-500 text-sm">Đang tải sản phẩm khuyến mãi...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-white">
                <i className="fa-solid fa-box-open text-[40px] text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-semibold">Hiện chưa có chương trình Flash Sale nào diễn ra.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, idx) => {
                  let pPrice = Number(product.price);
                  let pOldPrice = 0;
                  let discount = 0;
                  if (product.is_flash_sale && product.flash_sale_discount_percent) {
                    pOldPrice = pPrice;
                    pPrice = pPrice * (1 - product.flash_sale_discount_percent / 100);
                    discount = product.flash_sale_discount_percent;
                  }
                  const imgUrl = product.product_images?.[0]?.image_url || "/giaodienkhachhang/img/banner/ip-1.png";
                  return (
                    <div
                      key={idx}
                      className="flash-card bg-white border border-gray-200 rounded-xl overflow-hidden hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                    >
                      <div className="relative">
                        <Link href={`/chitietsanpham?slug=${product.slug}`}>
                          <img src={imgUrl} className="w-full h-52 object-contain p-4 bg-gray-50/30" alt={product.name} />
                        </Link>
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-md font-bold">
                            -{discount}%
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm mb-1 text-gray-800 line-clamp-2">
                            <Link href={`/chitietsanpham?slug=${product.slug}`} className="hover:text-brand-purple">{product.name}</Link>
                          </h4>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="font-bold text-xl text-brand-purple">{pPrice.toLocaleString("vi-VN")}đ</span>
                            {pOldPrice > 0 && (
                              <span className="text-xs text-gray-400 line-through">{pOldPrice.toLocaleString("vi-VN")}đ</span>
                            )}
                          </div>
                        </div>
                        <Link href={`/chitietsanpham?slug=${product.slug}`} className="w-full bg-brand-purple hover:bg-purple-700 text-white py-3 rounded-lg text-sm font-medium transition-colors text-center block">
                          Mua ngay
                        </Link>
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
