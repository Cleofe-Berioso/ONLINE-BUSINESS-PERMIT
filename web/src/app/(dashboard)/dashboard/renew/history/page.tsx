import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalHistoryContent } from "@/components/dashboard/renewal-history-content";

export const metadata = { title: "Renewal History" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Renewal History</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your past renewals and renewal status
        </p>
      </div>
      <RenewalHistoryContent />
    </div>
  );
}
