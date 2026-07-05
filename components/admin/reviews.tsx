"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "../admin-shell";
import { useApp } from "@/lib/app-context";

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const { showToast, adminSearch } = useApp();

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("✗ Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này và toàn bộ phản hồi liên quan?")) return;

    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("✓ Đã xóa đánh giá thành công");
        fetchReviews();
      } else {
        showToast("✗ Xóa đánh giá thất bại");
      }
    } catch (err) {
      console.error(err);
      showToast("✗ Đã xảy ra lỗi");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) return;

    try {
      const res = await fetch(`/api/reviews?replyId=${replyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("✓ Đã xóa phản hồi thành công");
        fetchReviews();
      } else {
        showToast("✗ Xóa phản hồi thất bại");
      }
    } catch (err) {
      console.error(err);
      showToast("✗ Đã xảy ra lỗi");
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyComment.trim()) return;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          comment: replyComment.trim(),
        }),
      });

      if (res.ok) {
        showToast("✓ Đã gửi phản hồi thành công");
        setReplyComment("");
        setReplyingReviewId(null);
        fetchReviews();
      } else {
        showToast("✗ Gửi phản hồi thất bại");
      }
    } catch (err) {
      console.error(err);
      showToast("✗ Đã xảy ra lỗi");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 text-amber-400 text-xs">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="material-symbols-outlined text-[16px]">
            {i < rating ? "star" : "star_outline"}
          </span>
        ))}
      </div>
    );
  };

  // Calculate statistics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const totalLikes = reviews.reduce((sum, r) => sum + r.likesCount, 0);
  
  const filteredReviews = reviews.filter(
    (r) =>
      (r.userName || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (r.productName || "").toLowerCase().includes(adminSearch.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <AdminShell
      activeKey="reviews"
      title="Quản lý Đánh giá"
      subtitle="Quản lý và phản hồi các đánh giá của khách hàng về sản phẩm"
      actionLabel="Làm mới"
      actionIcon="refresh"
      sectionLabel="Đánh giá"
      onActionClick={() => { fetchReviews(); showToast("✓ Đã đồng bộ đánh giá mới nhất."); }}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">rate_review</span>
            </div>
            <div>
              <p className="text-[12px] text-on-surface-variant font-bold uppercase tracking-wider">Tổng Đánh giá</p>
              <h3 className="text-3xl font-black text-on-surface">{totalReviews}</h3>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-500">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div>
              <p className="text-[12px] text-on-surface-variant font-bold uppercase tracking-wider">Điểm Trung bình</p>
              <h3 className="text-3xl font-black text-on-surface">{avgRating} / 5</h3>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[24px]">favorite</span>
            </div>
            <div>
              <p className="text-[12px] text-on-surface-variant font-bold uppercase tracking-wider">Lượt Yêu thích</p>
              <h3 className="text-3xl font-black text-on-surface">{totalLikes}</h3>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h3 className="font-bold text-[16px] text-on-surface mb-6 uppercase tracking-wider">Danh sách Đánh giá</h3>
          
          {loading ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined animate-spin text-[36px] text-primary">autorenew</span>
              <p className="text-on-surface-variant text-[14px] mt-2">Đang tải danh sách đánh giá...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-40">chat_bubble_outline</span>
              <p className="text-[14px] mt-2 font-bold">Không tìm thấy đánh giá phù hợp</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((r, rIdx) => (
                <div key={r.id} className={`p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 flex flex-col md:flex-row gap-5 items-start justify-between transition-all hover:border-outline`}>
                  {/* Left: Review Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-primary-container text-on-primary-container font-black px-3 py-1 rounded-full text-[11px] uppercase tracking-wide">
                        {r.productName}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-100 to-purple-200 border border-purple-200 flex items-center justify-center font-bold text-brand-purple text-[11px]">
                          {r.userAvatar ? (
                            <img src={r.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            r.userName ? r.userName.charAt(0).toUpperCase() : "?"
                          )}
                        </div>
                        <span className="font-bold text-[13px] text-on-surface">{r.userName}</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderStars(r.rating)}
                      <span className="text-red-500 flex items-center gap-1 text-[12px]">
                        <span className="material-symbols-outlined text-[14px]">favorite</span>
                        <span>{r.likesCount} thích</span>
                      </span>
                    </div>

                    {r.comment && (
                      <p className="text-[13px] text-on-surface leading-relaxed font-medium bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/40">
                        {r.comment}
                      </p>
                    )}

                    {r.imageUrl && (
                      <div className="max-w-[150px] border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                        <img src={r.imageUrl} alt="Review attachment" className="max-h-24 object-cover w-full" />
                      </div>
                    )}

                    {/* Replies Section */}
                    {r.replies && r.replies.length > 0 && (
                      <div className="border-l-2 border-primary/20 pl-4 space-y-3 bg-surface-container-low/30 p-3.5 rounded-r-xl">
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Phản hồi:</p>
                        {r.replies.map((reply: any) => (
                          <div key={reply.id} className="flex justify-between items-start gap-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-on-surface text-[12px]">{reply.userName}</span>
                                {reply.isAdmin && (
                                  <span className="bg-primary text-on-primary text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none">
                                    Admin
                                  </span>
                                )}
                                <span className="text-[10px] text-on-surface-variant">
                                  {new Date(reply.createdAt).toLocaleDateString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <p className="text-[12px] text-on-surface-variant leading-relaxed">{reply.comment}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteReply(reply.id)}
                              className="text-error hover:text-error/80 transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-error-container/10"
                              title="Xóa phản hồi"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Form */}
                    {replyingReviewId === r.id && (
                      <div className="flex gap-2 items-center bg-surface-container-low p-2.5 rounded-xl border border-outline-variant animate-fadeIn">
                        <input
                          type="text"
                          value={replyComment}
                          onChange={e => setReplyComment(e.target.value)}
                          placeholder="Nhập phản hồi chính thức của Admin..."
                          className="flex-grow bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:border-primary text-on-surface"
                          onKeyDown={e => {
                            if (e.key === "Enter") handleReplySubmit(r.id);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleReplySubmit(r.id)}
                          className="px-4 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Gửi
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyComment("");
                          }}
                          className="px-3 py-1.5 bg-outline-variant text-on-surface-variant text-xs font-bold rounded-lg hover:bg-outline-variant/80 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Review Actions */}
                  <div className="flex md:flex-col gap-2 mt-3 md:mt-0 flex-shrink-0">
                    {replyingReviewId !== r.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(r.id);
                          setReplyComment("");
                        }}
                        className="px-4 py-2 text-xs font-bold bg-primary text-on-primary hover:opacity-90 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">reply</span>
                        <span>Phản hồi</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(r.id)}
                      className="px-4 py-2 text-xs font-bold bg-error-container text-on-error-container hover:bg-error-container/90 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
