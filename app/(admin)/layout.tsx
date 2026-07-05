import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/admin");
  }

  return <>{children}</>;
}