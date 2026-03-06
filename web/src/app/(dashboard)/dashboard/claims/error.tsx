"use client";
import { useEffect } from "react";
import { DashboardError } from "@/components/dashboard/dashboard-error";
export default function ClaimsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <DashboardError title="Failed to load claims" description="Something went wrong while loading the claims list." digest={error.digest} reset={reset} />;
}
