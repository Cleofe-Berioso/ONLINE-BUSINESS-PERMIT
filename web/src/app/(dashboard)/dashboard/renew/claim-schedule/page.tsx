import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalSidebar } from "@/components/dashboard/renewal-sidebar";
import { UnderConstructionCard } from "@/components/dashboard/under-construction-card";

export const metadata = { title: "Claim Schedule" };

export default async function ClaimSchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex gap-6">
      <RenewalSidebar user={session.user} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Claim Schedule</h1>
          <p className="mt-1 text-sm text-gray-600">
            Schedule and manage your permit claim appointments
          </p>
        </div>
        <UnderConstructionCard pageTitle="Claim Schedule" />
      </div>
    </div>
  );
}
