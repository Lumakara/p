import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth; middleware also guards these routes.
  if (!(await isAdmin())) {
    redirect("/");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
