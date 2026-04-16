import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalDocumentsContent } from "@/components/dashboard/renewal-documents-content";

export const metadata = { title: "Documents - Renewal" };

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and upload documents for your renewal
        </p>
      </div>
      <RenewalDocumentsContent />
    </div>
  );
}
