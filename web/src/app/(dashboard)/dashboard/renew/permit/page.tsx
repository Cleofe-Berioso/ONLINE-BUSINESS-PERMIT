import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalPermitContent } from "@/components/dashboard/renewal-permit-content";

export const metadata = { title: "Renew Permit" };

export default async function PermitPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Renew Permit</h1>
        <p className="mt-1 text-sm text-gray-600">
          Start or continue your permit renewal process
        </p>
      </div>
      <RenewalPermitContent />
    </div>
  );
}
