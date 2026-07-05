"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CustomerShell } from "../customer-shell";

const newsCategories = [
  { id: "all", label: "Tất cả bài viết", icon: "fa-solid fa-newspaper" },
  { id: "tech", label: "Tin công nghệ", icon: "fa-solid fa-laptop-code" },
  { id: "tips", label: "Mẹo mua sắm", icon: "fa-solid fa-lightbulb" },
  { id: "lifestyle", label: "Đời sống số", icon: "fa-solid fa-mug-hot" },
];

const popularPosts = [
  { title: "Cách chọn mua củ sạc nhanh an toàn cho iPhone 17", views: "1.2k lượt xem" },
  { title: "Đánh giá chi tiết tai nghe chống ồn Sony WH-1000XM5", views: "982 lượt xem" },
  { title: "5 ứng dụng AI giúp tối ưu công việc của bạn hằng ngày", views: "850 lượt xem" },
];

export function CustomerNewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/news")
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Lỗi load tin tức:", err);
        setLoading(false);
      });
  }, []);

  return (
    <CustomerShell>
      <div className="max-w-[1280px] mx-auto px-4 py-5">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-[240px] shrink-0 flex flex-col gap-6">
            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 text-[14px] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-list text-brand-purple"></i> CHUYÊN MỤC
              </h3>
              <ul className="space-y-1 text-[13px]">
                {newsCategories.map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    {cat.icon && (cat.icon.startsWith("/") || cat.icon.startsWith("http")) ? (
                      <img src={cat.icon} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <i className={`${cat.icon || "fa-solid fa-folder"} w-5 text-center text-gray-400`}></i>
                    )}
                    {cat.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Posts */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 text-[14px] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-fire text-amber-500"></i> ĐỌC NHIỀU NHẤT
              </h3>
              <ul className="space-y-4 text-[12px]">
                {popularPosts.map((post, i) => (
                  <li key={i} className="group cursor-pointer">
                    <h4 className="font-semibold text-gray-700 group-hover:text-brand-purple line-clamp-2 transition-colors leading-tight">
                      {post.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 mt-1 block">{post.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main News Content */}
          <div className="flex-grow">
            {/* Top Featured Post */}
            {loading ? (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <i className="fa-solid fa-spinner fa-spin text-[30px] text-brand-purple mb-3" />
                <p className="text-gray-500 text-sm">Đang tải tin tức công nghệ...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <i className="fa-regular fa-newspaper text-[40px] text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-semibold">Hiện chưa có bài viết tin tức nào.</p>
              </div>
            ) : (
              // Grid Articles
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((item, idx) => (
                  <div key={item.id.toString()} className="news-card bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
                    <img src={item.thumbnail_url || "https://picsum.photos/seed/news/600/400"} className="w-full h-48 object-cover bg-gray-50" alt={item.title} />
                    <div className="p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <span className="text-xs text-brand-purple font-bold">TIN TỨC • {item.published_at ? new Date(item.published_at).toLocaleDateString("vi-VN") : new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                        <h3 onClick={() => setSelectedArticle(item)} className="font-bold text-[16px] mt-2 line-clamp-2 text-gray-800 hover:text-brand-purple transition-colors cursor-pointer">
                          <span>{item.title}</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{item.excerpt}</p>
                      </div>
                      <div className="pt-6">
                        <button 
                          onClick={() => setSelectedArticle(item)} 
                          className="w-full bg-brand-purple text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                        >
                          Đọc tiếp
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up overflow-hidden">
            {/* Cover image & close button */}
            <div className="relative h-64 md:h-80 shrink-0 bg-slate-100">
              <img 
                src={selectedArticle.thumbnail_url || "https://picsum.photos/seed/news/800/500"} 
                className="w-full h-full object-cover" 
                alt={selectedArticle.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="bg-brand-purple text-white text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Tin Tức
                </span>
                <h2 className="text-[20px] md:text-[24px] font-black mt-3 leading-tight text-white drop-shadow-md">
                  {selectedArticle.title}
                </h2>
              </div>
            </div>

            {/* Scrollable content pane */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold pb-4 border-b border-slate-100">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>Ngày đăng: {selectedArticle.published_at ? new Date(selectedArticle.published_at).toLocaleString("vi-VN") : new Date(selectedArticle.created_at).toLocaleString("vi-VN")}</span>
              </div>
              
              <div className="text-[15px] text-slate-700 leading-relaxed font-normal whitespace-pre-line custom-scrollbar pt-2">
                {selectedArticle.content || selectedArticle.excerpt || "Nội dung bài viết đang được cập nhật."}
              </div>
            </div>
            
            {/* Modal footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="bg-brand-purple text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Đóng bài đọc
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerShell>
  );
}
