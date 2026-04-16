import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RenewalProfileContent } from "@/components/dashboard/renewal-profile-content";

export const metadata = { title: "Profile - Renewal" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile & Account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and security preferences
        </p>
      </div>
      <RenewalProfileContent />
    </div>
  );
}
