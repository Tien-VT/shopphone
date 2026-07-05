import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth-session";
import { serializeBigInt } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { credential, accessToken } = await req.json();

    let email = "";
    let name = "";
    let picture = "";

    if (credential) {
      // Verify Google ID Token (JWT)
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const payload = await verifyRes.json();

      if (!verifyRes.ok || !payload.email) {
        return NextResponse.json({ error: "Xác thực Google ID Token thất bại." }, { status: 400 });
      }
      email = payload.email;
      name = payload.name || payload.given_name || payload.email.split("@")[0] || "Google User";
      picture = payload.picture;
    } else if (accessToken) {
      // Verify Google Access Token via userinfo endpoint
      const verifyRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const payload = await verifyRes.json();

      if (!verifyRes.ok || !payload.email) {
        return NextResponse.json({ error: "Xác thực Google Access Token thất bại." }, { status: 400 });
      }
      email = payload.email;
      name = payload.name || payload.given_name || payload.email.split("@")[0] || "Google User";
      picture = payload.picture;
    } else {
      return NextResponse.json({ error: "Mã xác thực Google không hợp lệ." }, { status: 400 });
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    // Find or create user
    let user = await prisma.users.findUnique({
      where: { email },
    });

    if (user) {
      if (user.status === "locked") {
        return NextResponse.json({ error: "Tài khoản của bạn đã bị khóa." }, { status: 403 });
      }

      // Update avatar and name if changed
      const needsUpdate =
        (picture && user.avatar_url !== picture) ||
        (name && !user.full_name);
      if (needsUpdate) {
        user = await prisma.users.update({
          where: { id: user.id },
          data: {
            ...(picture ? { avatar_url: picture } : {}),
            ...(!user.full_name && name ? { full_name: name } : {}),
          },
        });
      }
    } else {
      // Register user with placeholder password hash
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
          data: {
            email,
            full_name: name,
            password_hash: "$2b$10$google-oauth-placeholder-hash",
            role: "customer",
            status: "active",
            avatar_url: picture || null,
          },
        });

        // Initialize user cart
        await tx.carts.create({
          data: { user_id: newUser.id },
        });

        return newUser;
      });
    }

    // Set cookie session
    await setSession({
      userId: user.id.toString(),
      role: user.role,
      email: user.email,
      name: user.full_name,
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    }));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to authenticate Google user" },
      { status: 500 }
    );
  }
}
