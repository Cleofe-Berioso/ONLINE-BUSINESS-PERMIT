import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalSidebar } from "@/components/dashboard/renewal-sidebar";
import { RenewalPermitContent } from "@/components/dashboard/renewal-permit-content";

export const metadata = { title: "Renew Permit" };

export default async function PermitPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex gap-6">
      <RenewalSidebar user={session.user} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Renew Permit</h1>
          <p className="mt-1 text-sm text-gray-600">
            Start or continue your permit renewal process
          </p>
        </div>
        <RenewalPermitContent />
      </div>
    </div>
  );
}
