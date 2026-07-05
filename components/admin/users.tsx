"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, adminSearch } = useApp();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === "active" ? "locked" : "active";
    const phrase = nextStatus === "locked" ? "Khóa" : "Mở khóa";
    if (!confirm(`Bạn có chắc chắn muốn ${phrase.toLowerCase()} người dùng này?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id.toString(), status: nextStatus }),
      });
      if (res.ok) {
        showToast(`✓ Đã ${phrase.toLowerCase()} tài khoản thành công.`);
        fetchUsers();
      } else {
        const errData = await res.json();
        showToast(`✗ Thao tác thất bại: ${errData.error}`);
      }
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    }
  };


  const searchKey = adminSearch || searchTerm;
  const filteredUsers = users.filter(
    (user) =>
      (user.full_name || "").toLowerCase().includes(searchKey.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchKey.toLowerCase()) ||
      (user.phone || "").includes(searchKey)
  );

  const activeCount = users.filter((u) => u.status === "active").length;
  const lockedCount = users.filter((u) => u.status === "locked").length;
  const diamondCount = users.filter((u) => u.loyalty_tier === "diamond").length;
  const goldCount = users.filter((u) => u.loyalty_tier === "gold").length;

  return (
    <AdminShell
      activeKey="users"
      title="Quản lý người dùng"
      subtitle="Quản trị viên"
      actionLabel="Thêm người dùng"
      actionIcon="person_add"
      sectionLabel="Admin"
      onActionClick={() => showToast("ℹ Đăng ký người dùng được thực hiện tự động ở phía khách hàng.")}
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Quản lý người dùng</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Quản lý danh sách khách hàng và phân hạng thành viên trong hệ thống ShopNow.
            </p>
          </div>
          <div className="flex gap-3">
            <input
              className="bg-white border border-outline-variant rounded-xl px-4 py-2 text-[14px] text-gray-800 outline-none"
              placeholder="Tìm nhanh người dùng..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="rounded-2xl border border-outline-variant bg-white px-4 py-2 text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors shadow-sm">
              Bộ lọc
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-fixed/20 rounded-2xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <span className="text-secondary font-bold text-sm">Ổn định</span>
            </div>
            <p className="text-on-surface-variant text-[13px]">Tổng người dùng</p>
            <h3 className="text-[24px] font-bold text-on-surface mt-1">{users.length}</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-tertiary-fixed-dim/20 rounded-2xl flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
              </div>
              <span className="text-secondary font-bold text-sm">{diamondCount} khách</span>
            </div>
            <p className="text-on-surface-variant text-[13px]">Kim cương</p>
            <h3 className="text-[24px] font-bold text-on-surface mt-1">{activeCount} Hoạt động</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary-container/30 rounded-2xl flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
              <span className="text-on-surface-variant text-sm font-semibold">{goldCount} khách</span>
            </div>
            <p className="text-on-surface-variant text-[13px]">Hạng Vàng</p>
            <h3 className="text-[24px] font-bold text-on-surface mt-1">Vàng & Bạc</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-error-container/30 rounded-2xl flex items-center justify-center text-error">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_off</span>
              </div>
              <span className="text-error font-bold text-sm">Khóa</span>
            </div>
            <p className="text-on-surface-variant text-[13px]">Bị khóa</p>
            <h3 className="text-[24px] font-bold text-on-surface mt-1">{lockedCount} tài khoản</h3>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-[30px] mb-3"></i>
              <p className="text-gray-500 text-sm">Đang tải danh sách người dùng...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant text-[13px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input className="rounded text-primary focus:ring-primary border-outline" type="checkbox" />
                    </th>
                    <th className="px-6 py-4">Tên người dùng</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Số điện thoại</th>
                    <th className="px-6 py-4 text-center">Hạng thành viên</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-[14px]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-5">
                        <input className="rounded text-primary focus:ring-primary border-outline" type="checkbox" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm uppercase">
                            {user.full_name.charAt(0)}
                          </div>
                          <div className="font-bold text-on-surface">{user.full_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">{user.email}</td>
                      <td className="px-6 py-5 text-on-surface-variant">{user.phone || "Chưa cập nhật"}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold ${
                          user.loyalty_tier === "diamond"
                            ? "bg-purple-100 text-purple-700"
                            : user.loyalty_tier === "gold"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {user.loyalty_tier === "diamond" ? "diamond" : "workspace_premium"}
                          </span>
                          {user.loyalty_tier === "diamond" ? "Kim cương" : user.loyalty_tier === "gold" ? "Vàng" : "Đồng"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 text-on-surface-variant">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              user.status === "active"
                                ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                            }`}
                          >
                            {user.status === "active" ? "Khóa" : "Mở khóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
