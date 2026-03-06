"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

interface DashboardErrorProps {
  title?: string;
  description?: string;
  digest?: string;
  reset: () => void;
}

export function DashboardError({
  title = "Something went wrong",
  description = "An error occurred while loading this page. Please try again.",
  digest,
  reset,
}: DashboardErrorProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      {digest && (
        <p className="mt-1 text-xs text-gray-400">Error ID: {digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
