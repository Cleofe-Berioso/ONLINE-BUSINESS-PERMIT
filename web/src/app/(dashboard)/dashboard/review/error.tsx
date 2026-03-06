"use client";
import { useEffect } from "react";
import { DashboardError } from "@/components/dashboard/dashboard-error";
export default function ReviewError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <DashboardError title="Failed to load review" description="Something went wrong while loading the review page." digest={error.digest} reset={reset} />;
}
