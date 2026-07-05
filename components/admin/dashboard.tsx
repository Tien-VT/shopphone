"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

const chartBars = [
  { height: "h-[40%]", label: "Th2", tooltip: null },
  { height: "h-[60%]", label: "Th3", tooltip: null },
  { height: "h-[85%]", label: "Th4", tooltip: "850Mđ" },
  { height: "h-[55%]", label: "Th5", tooltip: null },
  { height: "h-[70%]", label: "Th6", tooltip: null },
  { height: "h-[45%]", label: "Th7", tooltip: null },
  { height: "h-[65%]", label: "CN", tooltip: null },
  { height: "h-[50%]", label: "Nay", tooltip: null }
];

export function AdminDashboardPage() {
  const [filter, setFilter] = useState("today");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setStatsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        setLoading(false);
      });
  }, []);

  const stats = [
    {
      label: "Tổng doanh thu",
      value: statsData?.totalRevenue || "0đ",
      change: "+12.5%",
      trendingUp: true,
      icon: "payments",
      colorClass: "bg-primary-fixed text-primary",
      barColor: "bg-primary",
      width: "w-3/4"
    },
    {
      label: "Tổng số đơn hàng",
      value: statsData?.totalOrders || "0",
      change: "+8.2%",
      trendingUp: true,
      icon: "shopping_cart",
      colorClass: "bg-[#e9fff5] text-emerald-600",
      barColor: "bg-emerald-500",
      width: "w-[82%]"
    },
    {
      label: "Khách hàng đăng ký",
      value: statsData?.totalUsers || "0",
      change: "+5.1%",
      trendingUp: true,
      icon: "group",
      colorClass: "bg-tertiary-fixed/30 text-tertiary",
      barColor: "bg-tertiary",
      width: "w-2/3"
    },
    {
      label: "Tỷ lệ chuyển đổi",
      value: statsData?.conversionRate || "3.85%",
      change: "+4.1%",
      trendingUp: true,
      icon: "ads_click",
      colorClass: "bg-primary-fixed-dim text-primary",
      barColor: "bg-primary-container",
      width: "w-2/5"
    }
  ];

  const recentActivities = statsData?.activities || [];
  const bestSellers = statsData?.bestSellers || [];
  const vipCustomers = statsData?.vipCustomers || [];

  const { showToast } = useApp();

  return (
    <AdminShell
      activeKey="dashboard"
      title="Tổng quan hệ thống"
      subtitle="Super Admin"
      actionLabel="Thêm dữ liệu"
      actionIcon="add"
      sectionLabel="Báo cáo"
      onActionClick={() => showToast("ℹ Vui lòng chọn danh mục quản lý cụ thể bên thanh điều hướng để thực hiện thêm dữ liệu.")}
    >
      <div className="space-y-8 animate-slide-up">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-primary tracking-widest uppercase">
              <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
              Bảng điều khiển trực tuyến
            </div>
            <h1 className="text-[32px] font-black text-slate-800 tracking-tight mt-1">Chào buổi sáng, Admin!</h1>
            <p className="text-[15px] text-slate-400 font-medium">Dưới đây là tóm tắt toàn bộ hoạt động của cửa hàng ShopNow hôm nay.</p>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                filter === "today" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setFilter("7d")}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                filter === "7d" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setFilter("30d")}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
                filter === "30d" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              30 ngày qua
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <i className="fa-solid fa-circle-notch fa-spin text-primary text-[36px] mb-4"></i>
            <p className="text-slate-400 font-bold text-[14px]">Đang đồng bộ dữ liệu hệ thống...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid - High End Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="admin-card-premium p-6 rounded-[24px] space-y-4 relative overflow-hidden group">
                  {/* Glowing Accent Spot */}
                  <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity duration-300 group-hover:opacity-20 ${
                    idx === 0 ? "bg-primary" : idx === 1 ? "bg-emerald-500" : idx === 2 ? "bg-amber-500" : "bg-blue-500"
                  }`}></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      idx === 0 ? "bg-primary/10 text-primary" : idx === 1 ? "bg-emerald-500/10 text-emerald-600" : idx === 2 ? "bg-amber-500/10 text-amber-600" : idx === 3 ? "bg-blue-500/10 text-blue-600" : "bg-slate-100 text-slate-700"
                    }`}>
                      <span className="material-symbols-outlined text-[24px] font-semibold">{stat.icon}</span>
                    </div>
                    
                    <span className={`flex items-center font-extrabold text-[12px] px-2.5 py-1 rounded-full ${
                      stat.trendingUp ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                    }`}>
                      <span className="material-symbols-outlined text-[14px] mr-1 font-bold">
                        {stat.trendingUp ? "trending_up" : "trending_down"}
                      </span>
                      {stat.change}
                    </span>
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-[28px] font-black text-slate-800 tracking-tight mt-1">{stat.value}</h3>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative z-10">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      idx === 0 ? "bg-gradient-to-r from-primary to-violet-500" : idx === 1 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : idx === 2 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-blue-500 to-sky-400"
                    } ${stat.width}`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Premium Simulated Chart */}
              <div className="lg:col-span-2 admin-card-premium rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-[18px] font-extrabold text-slate-800">Biểu đồ tăng trưởng</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">So sánh doanh thu thực tế và định mức bán hàng</p>
                  </div>
                  <button className="flex items-center gap-1 text-primary font-bold text-[13px] hover:text-primary-container transition-colors">
                    <span>Xem chi tiết</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                {/* Gridlines in background */}
                <div className="relative h-64 flex items-end justify-between gap-4 px-2 pt-4">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-100 pb-1">
                    <div className="w-full border-t border-slate-100/70 h-px"></div>
                    <div className="w-full border-t border-slate-100/70 h-px"></div>
                    <div className="w-full border-t border-slate-100/70 h-px"></div>
                    <div className="w-full border-t border-slate-100/70 h-px"></div>
                  </div>

                  {chartBars.map((bar, idx) => (
                    <div key={idx} className="w-full bg-slate-50 hover:bg-slate-100 transition-all rounded-t-2xl flex flex-col justify-end h-full relative group cursor-pointer z-10">
                      {bar.tooltip && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                          {bar.tooltip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      )}
                      
                      <div className={`w-full bg-gradient-to-t from-primary/80 to-violet-600 rounded-t-2xl group-hover:brightness-110 transition-all ${bar.height} relative`}>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-4 text-[11px] font-bold text-slate-400 px-2 border-t border-slate-100 pt-3">
                  {chartBars.map((bar, idx) => (
                    <span key={idx}>{bar.label}</span>
                  ))}
                </div>
              </div>

              {/* Recent Activity - Styled Timeline */}
              <div className="admin-card-premium rounded-[24px] p-6 space-y-6 flex flex-col">
                <h3 className="text-[18px] font-extrabold text-slate-800">Hoạt động gần đây</h3>
                
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-slate-400 py-12 text-center font-semibold">Chưa có hoạt động nào trong hôm nay.</p>
                ) : (
                  <div className="relative flex-grow pl-4 border-l-2 border-slate-100 space-y-6 custom-scrollbar overflow-y-auto max-h-[260px]">
                    {recentActivities.map((act: any, idx: number) => (
                      <div key={idx} className="relative pl-6">
                        {/* Dot indicator */}
                        <span className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                          act.colorClass || "bg-primary"
                        }`} style={{ boxShadow: "0 0 0 3px rgba(255,255,255,1)" }}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        </span>
                        
                        <div>
                          <p className="text-[13px] font-bold text-slate-700 leading-tight">
                            {act.desc}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {new Date(act.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Best Sellers & VIP Customers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best sellers */}
              <div className="admin-card-premium rounded-[24px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[18px] font-extrabold text-slate-800">Sản phẩm bán chạy</h3>
                  <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">more_horiz</span>
                </div>
                
                <div className="space-y-3.5">
                  {bestSellers.map((prod: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3.5">
                        <img className="w-12 h-12 rounded-xl object-cover border border-slate-100 p-0.5 bg-white" src={prod.image} alt={prod.name} />
                        <div>
                          <p className="text-[14px] font-extrabold text-slate-700">{prod.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{prod.category} • {prod.sales} đã bán</p>
                        </div>
                      </div>
                      <p className="text-[14px] font-extrabold text-primary bg-primary/5 px-3 py-1.5 rounded-xl">{prod.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIP Customers */}
              <div className="admin-card-premium rounded-[24px] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[18px] font-extrabold text-slate-800">Khách hàng hàng đầu</h3>
                  <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">more_horiz</span>
                </div>
                
                <div className="space-y-3.5">
                  {vipCustomers.map((vip: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/10 to-violet-500/10 flex items-center justify-center text-primary font-black text-[14px] border border-primary/10">
                          {vip.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[14px] font-extrabold text-slate-700">{vip.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-bold text-slate-400">{vip.orders} đơn hàng</span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              vip.tier === "Diamond" || vip.tier === "Kim cương" ? "bg-cyan-50 text-cyan-600 border border-cyan-150"
                              : vip.tier === "Gold" || vip.tier === "Vàng" ? "bg-amber-50 text-amber-600 border border-amber-150"
                              : "bg-slate-100 text-slate-600"
                            }`}>
                              Hạng {vip.tier}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[14px] font-extrabold text-primary bg-primary/5 px-3 py-1.5 rounded-xl">{vip.spent}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
