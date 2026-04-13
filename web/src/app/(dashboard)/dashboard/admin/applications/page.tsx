import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminApplicationsClient } from "@/components/dashboard/admin-applications-client";

export const metadata = { title: "Applications Management" };

export default async function AdminApplicationsPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATOR" && session.user.role !== "REVIEWER" && session.user.role !== "STAFF") {
    redirect("/dashboard");
  }

  return <AdminApplicationsClient />;
}
