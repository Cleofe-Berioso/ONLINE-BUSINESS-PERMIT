import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if this is a renewal route — if so, skip the dashboard shell
  // Renewal routes have their own layout at /dashboard/renew/layout.tsx
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isRenewalRoute = pathname.startsWith("/dashboard/renew");

  if (isRenewalRoute) {
    // Renewal routes render their own layout, so just return children
    return children;
  }

  // Fetch user status for applicants
  let userStatus = null;
  if (session.user.role === "APPLICANT") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { status: true },
    });
    userStatus = user?.status || null;
  }

  return (
    <DashboardShell
      user={session.user}
      userStatus={userStatus}
    >
      {children}
    </DashboardShell>
  );
}

