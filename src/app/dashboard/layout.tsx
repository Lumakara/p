import { redirect } from "next/navigation";
import { isAdmin, syncCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep the DB user in sync, then enforce admin access (defense in depth;
  // middleware also guards these routes).
  await syncCurrentUser().catch(() => null);
  if (!(await isAdmin())) {
    redirect("/");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
