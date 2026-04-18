import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalClaimScheduleContent } from "@/components/dashboard/renewal-claim-schedule-content";

export const metadata = { title: "Claim Schedule - Renewal" };

export default async function ClaimSchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Claim Schedule</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Schedule and manage your permit claim appointments
        </p>
      </div>
      <RenewalClaimScheduleContent />
    </div>
  );
}
