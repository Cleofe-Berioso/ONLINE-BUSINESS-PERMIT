"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <a
          href="/"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </a>
      </div>
    </div>
  );
}
