"use client";
import { useEffect } from "react";
import { DashboardError } from "@/components/dashboard/dashboard-error";
export default function IssuanceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <DashboardError title="Failed to load issuance" description="Something went wrong while loading permit issuance records." digest={error.digest} reset={reset} />;
}
