import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalSidebar } from "@/components/dashboard/renewal-sidebar";
import { RenewalMainContent } from "@/components/dashboard/renewal-main-content";

export const metadata = { title: "Renewal Portal" };

export default async function RenewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex gap-6">
      <RenewalSidebar user={session.user} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Renewal Portal</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your permit renewals and track renewal history
          </p>
        </div>
        <RenewalMainContent />
      </div>
    </div>
  );
}
