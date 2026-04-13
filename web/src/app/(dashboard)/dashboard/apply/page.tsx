import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PermitApplicationClient } from "@/components/dashboard/permit-application-client";

export const metadata = { title: "Apply for Permit" };

export default async function ApplyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <PermitApplicationClient />;
}
