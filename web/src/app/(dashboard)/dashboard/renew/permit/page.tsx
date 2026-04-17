import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Renew Permit" };

export default async function PermitPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Redirect to main renewal page
  redirect("/dashboard/renew");
}
