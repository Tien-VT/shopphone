"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { showToast, adminSearch } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
    sortOrder: "0",
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      icon: "",
      sortOrder: "0",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || "",
      sortOrder: String(cat.sort_order || "0"),
      isActive: cat.is_active,
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Auto generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingCategory ? "PUT" : "POST";
      const payload = editingCategory
        ? { id: editingCategory.id.toString(), ...formData }
        : formData;

      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Thất bại: ${data.error || "Lỗi lưu danh mục"}`);
        return;
      }

      showToast(editingCategory ? "✓ Đã cập nhật danh mục thành công." : "✓ Đã thêm danh mục thành công.");
      setShowModal(false);
      fetchCategories();
    } catch {
      showToast("✗ Gặp sự cố kết nối.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Không thể xóa: ${data.error || "Lỗi hệ thống"}`);
        return;
      }
      showToast("✓ Đã xóa danh mục thành công.");
      fetchCategories();
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    }
  };


  const filteredCategories = categories.filter(
    (cat) =>
      (cat.name || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (cat.slug || "").toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <AdminShell
      activeKey="categories"
      title="Quản lý danh mục"
      subtitle="Quản trị viên"
      actionLabel="Thêm danh mục"
      actionIcon="add"
      sectionLabel="Admin"
      onActionClick={openAddModal}
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Quản lý danh mục</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Quản lý danh mục sản phẩm, phân cấp hiển thị trên thanh tìm kiếm và bộ lọc cửa hàng.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary text-on-primary px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity text-[14px] shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo danh mục mới
          </button>
        </div>

        {/* Categories List Table */}
        <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-[30px] mb-3"></i>
              <p className="text-gray-500 text-sm">Đang tải danh mục sản phẩm...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-[60px] text-gray-300 block mb-4">folder_open</span>
              <p className="text-gray-500 text-sm">Không tìm thấy danh mục phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant text-[13px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Tên danh mục</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Icon CSS Class</th>
                    <th className="px-6 py-4 text-center">Thứ tự sắp xếp</th>
                    <th className="px-6 py-4 text-center">Trạng thái hiển thị</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-[14px]">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-purple-50 text-brand-purple rounded-xl flex items-center justify-center overflow-hidden">
                            {cat.icon && (cat.icon.startsWith("/") || cat.icon.startsWith("http")) ? (
                              <img src={cat.icon} alt="" className="w-6 h-6 object-contain" />
                            ) : (
                              <i className={cat.icon || "fa-solid fa-folder"}></i>
                            )}
                          </div>
                          <div className="font-bold text-on-surface">{cat.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant font-mono text-xs">{cat.slug}</td>
                      <td className="px-6 py-5 text-on-surface-variant text-xs">{cat.icon || "N/A"}</td>
                      <td className="px-6 py-5 text-center font-semibold text-gray-700">{cat.sort_order}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${
                          cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {cat.is_active ? "Đang hiển thị" : "Đang ẩn"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 hover:bg-primary-container/10 rounded-lg text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id.toString())}
                            className="p-2 hover:bg-error-container/10 rounded-lg text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete_outline</span>
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

        {/* Categories Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden border border-outline-variant flex flex-col">
              <div className="p-6 bg-gradient-to-r from-primary to-primary-container text-white flex justify-between items-center">
                <h3 className="text-[18px] font-bold">{editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Tên danh mục</label>
                  <input
                    name="name"
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                    placeholder="Ví dụ: Thiết bị thông minh"
                    value={formData.name}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Đường dẫn tĩnh (Slug)</label>
                  <input
                    name="slug"
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 font-mono text-xs"
                    placeholder="vi-du-thiet-bi-thong-minh"
                    value={formData.slug}
                    onChange={handleInputChange}
                  />
                </div>

                 <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Biểu tượng (Icon)</label>
                  <div className="flex items-center gap-3">
                    <input
                      name="icon"
                      type="text"
                      className="flex-grow bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                      placeholder="FontAwesome class hoặc URL ảnh..."
                      value={formData.icon}
                      onChange={handleInputChange}
                    />
                    
                    <label className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-outline-variant rounded-xl cursor-pointer text-xs font-bold text-gray-600 flex items-center gap-1.5 select-none transition-colors">
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>Tải ảnh lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: fd,
                            });
                            if (!res.ok) {
                              const err = await res.json();
                              showToast(`✗ Tải ảnh thất bại: ${err.error || "Lỗi upload"}`);
                              return;
                            }
                            const data = await res.json();
                            setFormData(prev => ({ ...prev, icon: data.url }));
                            showToast("✓ Đã tải ảnh icon lên thành công!");
                          } catch (err) {
                            console.error(err);
                            showToast("✗ Tải ảnh lên thất bại");
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.icon && (formData.icon.startsWith("/") || formData.icon.startsWith("http")) && (
                    <div className="mt-2 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-gray-100">
                      <span className="text-xs text-gray-500 font-semibold">Xem trước icon:</span>
                      <img src={formData.icon} alt="" className="w-8 h-8 object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Thứ tự sắp xếp hiển thị</label>
                  <input
                    name="sortOrder"
                    required
                    type="number"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="accent-primary w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">Hiện danh mục này ngoài cửa hàng</label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-outline-variant hover:bg-gray-50 rounded-xl font-bold text-gray-600 text-sm transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-on-primary hover:opacity-90 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
