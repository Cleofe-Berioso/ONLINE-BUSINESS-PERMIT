"use client";
import { useEffect } from "react";
import { DashboardError } from "@/components/dashboard/dashboard-error";
export default function ProfileError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <DashboardError title="Failed to load profile" description="Something went wrong while loading your profile." digest={error.digest} reset={reset} />;
}
