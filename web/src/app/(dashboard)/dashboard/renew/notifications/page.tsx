import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalNotificationsContent } from "@/components/dashboard/renewal-notifications-content";

export const metadata = { title: "Notifications - Renewal" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your notification preferences and view recent updates
        </p>
      </div>
      <RenewalNotificationsContent />
    </div>
  );
}
