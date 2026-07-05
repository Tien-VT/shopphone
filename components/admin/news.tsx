"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminNewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const { showToast, adminSearch } = useApp();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    thumbnailUrl: "",
    status: "published",
  });

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/admin/news");
      if (res.ok) {
        const data = await res.json();
        setArticles(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openAddModal = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      thumbnailUrl: "",
      status: "published",
    });
    setShowModal(true);
  };

  const openEditModal = (art: any) => {
    setEditingArticle(art);
    setFormData({
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || "",
      content: art.content || "",
      thumbnailUrl: art.thumbnail_url || "",
      status: art.status,
    });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      title: val,
      slug: generatedSlug,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingArticle ? "PUT" : "POST";
      const payload = editingArticle
        ? { id: editingArticle.id.toString(), ...formData }
        : formData;

      const res = await fetch("/api/admin/news", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`✗ Thất bại: ${data.error || "Lỗi lưu bài viết"}`);
        return;
      }

      showToast(editingArticle ? "✓ Đã cập nhật bài viết thành công." : "✓ Đã thêm bài viết thành công.");
      setShowModal(false);
      fetchArticles();
    } catch {
      showToast("✗ Gặp sự cố kết nối.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      const res = await fetch(`/api/admin/news?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("✓ Đã xóa bài viết thành công.");
        fetchArticles();
      } else {
        const data = await res.json();
        showToast(`✗ Lỗi xóa bài viết: ${data.error}`);
      }
    } catch {
      showToast("✗ Lỗi kết nối hệ thống.");
    }
  };

  const filteredArticles = articles.filter(
    (item) =>
      (item.title || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (item.excerpt || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (item.slug || "").toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <AdminShell
      activeKey="news"
      title="Quản lý tin tức"
      subtitle="Quản lý viên"
      actionLabel="Viết bài mới"
      actionIcon="add"
      sectionLabel="Marketing"
      onActionClick={openAddModal}
    >
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[28px] font-black text-on-surface">Quản lý tin tức</h1>
            <p className="text-[15px] text-on-surface-variant mt-1">
              Cập nhật những thông tin mới nhất về xu hướng và thị trường, tin tức khuyến mãi.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary text-on-primary px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity text-[14px] shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Viết bài mới
          </button>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="glass-card bg-white p-6 rounded-[24px] flex flex-col justify-between shadow-sm border border-gray-100">
            <span className="text-primary material-symbols-outlined text-3xl mb-4">article</span>
            <div>
              <p className="text-[12px] font-medium text-gray-400">Tổng bài viết</p>
              <p className="text-[24px] font-black text-gray-800">{articles.length}</p>
            </div>
          </div>
          <div className="glass-card bg-white p-6 rounded-[24px] flex flex-col justify-between shadow-sm border border-gray-100">
            <span className="text-secondary material-symbols-outlined text-3xl mb-4">visibility</span>
            <div>
              <p className="text-[12px] font-medium text-gray-400">Đã xuất bản</p>
              <p className="text-[24px] font-black text-gray-800">{articles.filter((a) => a.status === "published").length}</p>
            </div>
          </div>
          <div className="glass-card bg-white p-6 rounded-[24px] flex flex-col justify-between shadow-sm border border-gray-100">
            <span className="text-tertiary material-symbols-outlined text-3xl mb-4">pending_actions</span>
            <div>
              <p className="text-[12px] font-medium text-gray-400">Bản nháp</p>
              <p className="text-[24px] font-black text-gray-800">{articles.filter((a) => a.status === "draft").length}</p>
            </div>
          </div>
          <div className="glass-card bg-white p-6 rounded-[24px] flex flex-col justify-between shadow-sm border border-gray-100">
            <span className="text-primary material-symbols-outlined text-3xl mb-4">trending_up</span>
            <div>
              <p className="text-[12px] font-medium text-gray-400">Tiến độ cập nhật</p>
              <p className="text-[24px] font-black text-gray-800">Hoàn thiện</p>
            </div>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white rounded-[24px] border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-primary text-[30px] mb-3"></i>
              <p className="text-gray-500 text-sm">Đang tải danh sách bài viết...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-[60px] text-gray-300 block mb-4">newspaper</span>
              <p className="text-gray-500 text-sm">Không tìm thấy bài viết phù hợp.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 text-[13px] font-bold text-gray-500 uppercase tracking-wider border-b border-outline-variant">
                    <th className="px-6 py-4">Tiêu đề</th>
                    <th className="px-6 py-4">Đường dẫn (Slug)</th>
                    <th className="px-6 py-4">Ngày đăng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-[14px]">
                  {filteredArticles.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            className="w-16 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100"
                            src={item.thumbnail_url || "/giaodienkhachhang/img/banner/ip-1.png"}
                            alt=""
                          />
                          <div>
                            <p className="font-bold text-on-surface line-clamp-1">{item.title}</p>
                            <p className="text-[12px] text-gray-400 mt-1">{item.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-xs text-on-surface-variant">{item.slug}</td>
                      <td className="px-6 py-5 text-on-surface-variant">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString("vi-VN") : "Chưa xuất bản"}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full font-bold text-[12px] ${
                          item.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {item.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 text-on-surface-variant">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 hover:bg-primary-container/10 rounded-lg text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id.toString())}
                            className="p-2 hover:bg-error-container/10 rounded-lg text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
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

        {/* Article Form Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-[580px] shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[92vh]">
              <div className="p-6 bg-gradient-to-r from-primary to-primary-container text-white flex justify-between items-center shrink-0">
                <h3 className="text-[18px] font-bold">{editingArticle ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Tiêu đề bài viết</label>
                  <input
                    name="title"
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                    placeholder="Ví dụ: Đánh giá iPhone 15 sau 6 tháng sử dụng"
                    value={formData.title}
                    onChange={handleTitleChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Slug</label>
                  <input
                    name="slug"
                    required
                    type="text"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 font-mono text-xs"
                    value={formData.slug}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Đường dẫn ảnh đại diện (Thumbnail URL)</label>
                  <input
                    name="thumbnailUrl"
                    type="text"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800"
                    placeholder="Ví dụ: /giaodienkhachhang/img/banner/blog-1.png"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Trạng thái bài viết</label>
                  <select
                    name="status"
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 bg-white"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="published">Xuất bản ngay</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Tóm tắt ngắn (Excerpt)</label>
                  <textarea
                    name="excerpt"
                    rows={2}
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 resize-none"
                    placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                    value={formData.excerpt}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">Nội dung chi tiết (HTML / Văn bản)</label>
                  <textarea
                    name="content"
                    rows={6}
                    required
                    className="w-full bg-gray-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none text-[14px] text-gray-800 resize-none font-mono text-xs"
                    placeholder="Nội dung bài viết chi tiết..."
                    value={formData.content}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-3 shrink-0">
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
