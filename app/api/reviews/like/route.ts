import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thích đánh giá" }, { status: 401 });
    }
    const currentUserId = BigInt(session.userId);
    const { reviewId } = await req.json();
    if (!reviewId) {
      return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
    }

    const reviewIdBig = BigInt(reviewId);
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    // Check if user already liked this review
    const existingLike = await prisma.review_likes.findUnique({
      where: {
        review_id_user_id: {
          review_id: reviewIdBig,
          user_id: currentUserId,
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.review_likes.delete({
        where: { id: existingLike.id }
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.review_likes.create({
        data: {
          review_id: reviewIdBig,
          user_id: currentUserId,
        }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
