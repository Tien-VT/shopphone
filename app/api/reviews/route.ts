import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdStr = searchParams.get("productId");
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const session = await getSession();
    const currentUserId = session ? BigInt(session.userId) : null;

    if (!productIdStr) {
      // If no productId, return recent reviews for homepage / testimonials / admin
      const allReviews = await prisma.product_reviews.findMany({
        orderBy: { created_at: "desc" },
        include: {
          products: {
            select: {
              name: true,
              slug: true,
            }
          },
          users: {
            select: {
              full_name: true,
              avatar_url: true,
            }
          },
          review_replies: {
            orderBy: { created_at: "asc" },
            include: {
              users: {
                select: {
                  full_name: true,
                  avatar_url: true,
                }
              }
            }
          },
          review_likes: true,
        }
      });

      const formatted = allReviews.map(r => ({
        id: r.id.toString(),
        productName: r.products.name,
        productSlug: r.products.slug,
        productId: r.product_id.toString(),
        user_id: r.user_id.toString(),
        userName: r.users.full_name,
        userAvatar: r.users.avatar_url || "",
        rating: r.rating,
        comment: r.comment || "",
        imageUrl: r.image_url || "",
        createdAt: r.created_at,
        likesCount: r.review_likes.length,
        replies: r.review_replies.map(reply => ({
          id: reply.id.toString(),
          review_id: reply.review_id.toString(),
          user_id: reply.user_id.toString(),
          userName: reply.users.full_name,
          userAvatar: reply.users.avatar_url || "",
          comment: reply.comment,
          isAdmin: reply.is_admin,
          createdAt: reply.created_at,
        }))
      }));

      return NextResponse.json(serializeBigInt(formatted));
    }

    const productId = BigInt(productIdStr);

    const reviews = await prisma.product_reviews.findMany({
      where: { product_id: productId },
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: {
            full_name: true,
            avatar_url: true,
          }
        },
        review_replies: {
          orderBy: { created_at: "asc" },
          include: {
            users: {
              select: {
                full_name: true,
                avatar_url: true,
              }
            }
          }
        },
        review_likes: true,
      }
    });

    const formattedReviews = reviews.map(r => {
      const likesCount = r.review_likes.length;
      const hasLiked = currentUserId ? r.review_likes.some(l => l.user_id === currentUserId) : false;

      return {
        id: r.id.toString(),
        product_id: r.product_id.toString(),
        user_id: r.user_id.toString(),
        userName: r.users.full_name,
        userAvatar: r.users.avatar_url || "",
        rating: r.rating,
        comment: r.comment || "",
        imageUrl: r.image_url || "",
        createdAt: r.created_at,
        likesCount,
        hasLiked,
        replies: r.review_replies.map(reply => ({
          id: reply.id.toString(),
          review_id: reply.review_id.toString(),
          user_id: reply.user_id.toString(),
          userName: reply.users.full_name,
          userAvatar: reply.users.avatar_url || "",
          comment: reply.comment,
          isAdmin: reply.is_admin,
          createdAt: reply.created_at,
        }))
      };
    });

    return NextResponse.json(serializeBigInt(formattedReviews));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thực hiện" }, { status: 401 });
    }
    const currentUserId = BigInt(session.userId);
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const body = await req.json();

    // Check if reply
    if (body.reviewId !== undefined) {
      const { reviewId, comment } = body;
      if (!comment || !comment.trim()) {
        return NextResponse.json({ error: "Vui lòng nhập nội dung phản hồi" }, { status: 400 });
      }

      const reply = await prisma.review_replies.create({
        data: {
          review_id: BigInt(reviewId),
          user_id: currentUserId,
          comment: comment.trim(),
          is_admin: session.role === "admin",
        },
        include: {
          users: {
            select: {
              full_name: true,
              avatar_url: true,
            }
          }
        }
      });

      return NextResponse.json(serializeBigInt({
        id: reply.id.toString(),
        review_id: reply.review_id.toString(),
        user_id: reply.user_id.toString(),
        userName: reply.users.full_name,
        userAvatar: reply.users.avatar_url || "",
        comment: reply.comment,
        isAdmin: reply.is_admin,
        createdAt: reply.created_at,
      }));
    }

    // Otherwise it's a review
    const { productId, rating, comment, imageUrl } = body;
    if (!productId || rating === undefined) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const review = await prisma.product_reviews.create({
      data: {
        product_id: BigInt(productId),
        user_id: currentUserId,
        rating: Number(rating),
        comment: comment ? comment.trim() : null,
        image_url: imageUrl || null,
      },
      include: {
        users: {
          select: {
            full_name: true,
            avatar_url: true,
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt({
      id: review.id.toString(),
      product_id: review.product_id.toString(),
      user_id: review.user_id.toString(),
      userName: review.users.full_name,
      userAvatar: review.users.avatar_url || "",
      rating: review.rating,
      comment: review.comment || "",
      imageUrl: review.image_url || "",
      createdAt: review.created_at,
      likesCount: 0,
      hasLiked: false,
      replies: [],
    }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("reviewId");
    const replyId = searchParams.get("replyId");

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    if (reviewId) {
      await prisma.product_reviews.delete({
        where: { id: BigInt(reviewId) }
      });
      return NextResponse.json({ success: true, message: "Đã xóa đánh giá" });
    } else if (replyId) {
      await prisma.review_replies.delete({
        where: { id: BigInt(replyId) }
      });
      return NextResponse.json({ success: true, message: "Đã xóa phản hồi" });
    }

    return NextResponse.json({ error: "Thiếu ID để xóa" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
