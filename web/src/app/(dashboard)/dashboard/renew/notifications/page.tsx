import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalSidebar } from "@/components/dashboard/renewal-sidebar";
import { UnderConstructionCard } from "@/components/dashboard/under-construction-card";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex gap-6">
      <RenewalSidebar user={session.user} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            View your renewal-related notifications
          </p>
        </div>
        <UnderConstructionCard pageTitle="Notifications" />
      </div>
    </div>
  );
}
