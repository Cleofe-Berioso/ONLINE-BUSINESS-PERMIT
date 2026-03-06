"use client";
import { useEffect } from "react";
import { DashboardError } from "@/components/dashboard/dashboard-error";
export default function ScheduleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <DashboardError title="Failed to load schedule" description="Something went wrong while loading available scheduling slots." digest={error.digest} reset={reset} />;
}
