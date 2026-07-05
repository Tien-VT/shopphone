"use client";

import { useState } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

const initialOffers = [
  {
    id: 1,
    name: "Miễn phí vận chuyển",
    description: "Freeship cho tất cả đơn hàng trên 200k toàn quốc.",
    type: "Shipping",
    status: "Đang chạy"
  },
  {
    id: 2,
    name: "Hoàn xu thành viên",
    description: "Hoàn 5% tối đa 100k xu cho thành viên Diamond.",
    type: "Cashback",
    status: "Đang chạy"
  },
  {
    id: 3,
    name: "Ưu đãi sinh nhật",
    description: "Tặng voucher giảm 20% cho thành viên trong tháng sinh nhật.",
    type: "Gift",
    status: "Tạm dừng"
  }
];

export function AdminOffersPage() {
  const [offers, setOffers] = useState(initialOffers);
  const { adminSearch, showToast } = useApp();

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa chiến dịch ưu đãi này?")) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const filteredOffers = offers.filter(
    (o) =>
      (o.name || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (o.description || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (o.type || "").toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <AdminShell
      activeKey="offers"
      title="Quản lý ưu đãi"
      subtitle="Quản lý viên"
      actionLabel="Thêm ưu đãi"
      actionIcon="add"
      sectionLabel="Marketing"
      onActionClick={() => showToast("ℹ Tính năng thêm ưu đãi mới sẽ được phát triển trong phiên bản tiếp theo.")}
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Quản lý ưu đãi</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Cấu hình các chiến dịch ưu đãi đặc quyền cho các cấp độ hội viên.
            </p>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="glass-card bg-white p-6 rounded-[28px] border border-outline-variant shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-[32px] text-primary bg-primary-fixed/20 p-2.5 rounded-2xl">redeem</span>
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                    offer.status === "Đang chạy" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {offer.status}
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-gray-800">{offer.name}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{offer.description}</p>
                <span className="inline-block mt-3 text-[11px] font-bold tracking-wider uppercase bg-surface-container px-3 py-1 rounded-md text-on-surface-variant">
                  {offer.type}
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button onClick={() => handleDelete(offer.id)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-error-container text-error transition-colors">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredOffers.length === 0 && (
          <p className="text-center text-gray-400 py-10">Không tìm thấy chiến dịch ưu đãi phù hợp.</p>
        )}
      </div>
    </AdminShell>
  );
}
