import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="rounded-full bg-blue-100 p-5">
        <FileQuestion className="h-14 w-14 text-blue-600" />
      </div>
      <h1 className="mt-6 text-5xl font-extrabold text-gray-900">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-gray-700">Page Not Found</h2>
      <p className="mt-3 max-w-sm text-sm text-gray-500">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Link>
        <Link
          href="/dashboard/applications"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          My Applications
        </Link>
      </div>
    </div>
  );
}
