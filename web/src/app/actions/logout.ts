"use server";

import { signOut, auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const REDIRECT_ERROR_CODE = "NEXT_REDIRECT";

/**
 * Server Action: Logout user
 * - Logs the logout activity to database
 * - Clears the NextAuth session
 * - Redirects to login page
 *
 * Note: In Next.js, redirect() throws a special error to signal navigation.
 * This is expected behavior and should NOT be caught.
 */
export async function logoutAction() {
  const session = await auth();

  if (session?.user) {
    // Log the logout activity to database
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "LOGOUT",
          entity: "User",
          entityId: session.user.id,
        },
      });
    } catch (error) {
      console.error("Failed to log logout activity:", error);
      // Continue with logout even if logging fails
    }
  }

  // Clear the NextAuth session and redirect
  // signOut() with redirect: true will automatically redirect
  await signOut({ redirectTo: "/login" });
}


