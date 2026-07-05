"use client";

import Link from "next/link";
import { CustomerShell } from "../customer-shell";

const tiers = [
  {
    name: "Bronze",
    minSpent: "Từ 0đ",
    color: "bg-[#CD7F32]/10 text-[#CD7F32]",
    benefits: ["Tích điểm 1%", "Ưu đãi sinh nhật cơ bản", "Hỗ trợ chuẩn"]
  },
  {
    name: "Silver",
    minSpent: "Từ 10.000.000đ",
    color: "bg-slate-300/30 text-slate-700",
    benefits: ["Tích điểm 2%", "Voucher sinh nhật 100k", "Freeship đơn hàng trên 200k", "Hỗ trợ nhanh"]
  },
  {
    name: "Gold",
    minSpent: "Từ 30.000.000đ",
    color: "bg-amber-100 text-amber-600",
    benefits: ["Tích điểm 3%", "Voucher sinh nhật 300k", "Freeship mọi đơn hàng", "Hỗ trợ 24/7", "Quà tặng năm mới"]
  },
  {
    name: "Diamond",
    minSpent: "Từ 100.000.000đ",
    color: "bg-[#4f22d6]/10 text-brand-purple",
    benefits: ["Tích điểm 5%", "Voucher sinh nhật 1 triệu", "Freeship hỏa tốc", "Đường dây nóng VIP", "Quà tặng hiện vật cao cấp"]
  }
];

export function CustomerMembershipPromoPage() {
  return (
    <CustomerShell>
      <div className="bg-background text-on-background min-h-screen pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#3800ae] px-6 py-16 md:py-24 text-white">
          <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-6">
              <span className="bg-[#6cf8bb] text-[#002113] px-4 py-1 rounded-full font-bold text-xs inline-block">
                Ưu đãi độc quyền
              </span>
              <h1 className="text-[40px] font-black leading-tight tracking-tight">
                Đặc quyền<br />
                <span className="text-[#6ffbbe]">Hội viên ShopNow</span>
              </h1>
              <p className="text-[16px] text-white/80 max-w-md">
                Nâng tầm trải nghiệm mua sắm với những đặc quyền dành riêng cho bạn. Tích điểm, nhận quà và tận hưởng ưu đãi VIP mỗi ngày.
              </p>
              <div className="flex gap-4">
                <button className="bg-white text-[#3800ae] px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors">
                  Tham gia ngay
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              {/* VIP Card Visual */}
              <div className="bg-gradient-to-br from-[#3800ae] via-[#4f22d6] to-[#603ae6] w-80 h-48 rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500 group">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] w-[200%] h-full animate-[shine_3s_infinite]" style={{ backgroundSize: "200% 100%" }}></div>
                <div className="flex justify-between items-start">
                  <span className="text-[20px] font-extrabold tracking-tighter italic">ShopNow</span>
                  <span className="material-symbols-outlined text-4xl text-[#6ffbbe]">contactless</span>
                </div>
                <div className="mt-12">
                  <p className="text-[10px] opacity-60 uppercase tracking-widest">Platinum Member</p>
                  <p className="text-[18px] font-black tracking-widest mt-1">NANCY TRAN</p>
                </div>
                <div className="absolute bottom-6 right-6">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-white">workspace_premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Membership Tiers Grid */}
        <section className="max-w-[1280px] mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-black text-primary">Hạng mức thành viên</h2>
            <p className="text-[16px] text-on-surface-variant mt-2">Càng mua sắm nhiều, đặc quyền càng cao</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 border border-outline-variant flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${t.color}`}>
                  <span className="material-symbols-outlined text-3xl">military_tech</span>
                </div>
                <h3 className="text-[20px] font-bold text-gray-800">{t.name}</h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1">{t.minSpent}</p>
                <div className="w-full h-px bg-outline-variant my-4"></div>
                <ul className="text-left w-full space-y-3 text-[13px] text-gray-600">
                  {t.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CustomerShell>
  );
}
