import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EnrollmentClient } from "@/components/dashboard/enrollment-client";

export const metadata = { title: "Enroll Business" };

export default async function EnrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <EnrollmentClient />;
}

