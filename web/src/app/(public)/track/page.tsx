"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield, Clock, CheckCircle, XCircle, FileText, Loader2, ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";

interface TrackResult {
  applicationNumber: string;
  businessName: string;
  type: string;
  applicationType?: string;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  history: { newStatus: string; createdAt: string; comment: string | null }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT:        { label: "Draft",        color: "text-gray-600 bg-gray-100",    icon: <FileText className="h-5 w-5" /> },
  SUBMITTED:    { label: "Submitted",    color: "text-blue-700 bg-blue-100",    icon: <Clock className="h-5 w-5" /> },
  UNDER_REVIEW: { label: "Under Review", color: "text-yellow-700 bg-yellow-100",icon: <Clock className="h-5 w-5" /> },
  APPROVED:     { label: "Approved",     color: "text-green-700 bg-green-100",  icon: <CheckCircle className="h-5 w-5" /> },
  REJECTED:     { label: "Rejected",     color: "text-red-700 bg-red-100",      icon: <XCircle className="h-5 w-5" /> },
  CANCELLED:    { label: "Cancelled",    color: "text-gray-500 bg-gray-100",    icon: <XCircle className="h-5 w-5" /> },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PublicTrackPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/public/track?number=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Not found"); return; }
      setResult(data.application);
    } finally {
      setLoading(false);
    }
  }

  const cfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG.DRAFT) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNav />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Track Your Application</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Enter your application number (e.g.{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">BP-2026-000001</code>
            ) to check its current status.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. BP-2026-000001"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase placeholder:normal-case"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Track Application
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && cfg && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Status Banner */}
            <div className={`flex items-center gap-3 px-5 py-4 ${cfg.color}`}>
              {cfg.icon}
              <div>
                <p className="font-semibold">{cfg.label}</p>
                <p className="text-xs opacity-80">{result.applicationNumber}</p>
              </div>
            </div>

            {/* Details */}
            <div className="divide-y px-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4 text-sm">
                <div>
                  <dt className="text-gray-500 text-xs uppercase font-medium mb-0.5">Business Name</dt>
                  <dd className="font-medium text-gray-900">{result.businessName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase font-medium mb-0.5">Application Type</dt>
                  <dd className="font-medium text-gray-900 capitalize">
                    {(result.applicationType ?? result.type).toLowerCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs uppercase font-medium mb-0.5">Date Submitted</dt>
                  <dd className="font-medium text-gray-900">{formatDate(result.createdAt)}</dd>
                </div>
                {result.approvedAt && (
                  <div>
                    <dt className="text-gray-500 text-xs uppercase font-medium mb-0.5">Date Approved</dt>
                    <dd className="font-medium text-green-700">{formatDate(result.approvedAt)}</dd>
                  </div>
                )}
                {result.rejectedAt && (
                  <div>
                    <dt className="text-gray-500 text-xs uppercase font-medium mb-0.5">Date Rejected</dt>
                    <dd className="font-medium text-red-700">{formatDate(result.rejectedAt)}</dd>
                  </div>
                )}
              </dl>

              {/* History Timeline */}
              {result.history.length > 0 && (
                <div className="py-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">Status History</h3>
                  <ol className="space-y-3">
                    {result.history.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                        <div>
                          <span className="font-medium text-gray-900">
                            {h.newStatus.replace(/_/g, " ")}
                          </span>
                          <span className="ml-2 text-gray-400 text-xs">{formatDate(h.createdAt)}</span>
                          {h.comment && (
                            <p className="mt-0.5 text-xs text-gray-500">{h.comment}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-5 py-3 text-xs text-gray-500 border-t">
              For inquiries, contact the Business Permits & Licensing Office.
            </div>
          </div>
        )}

        {/* Instructions Card */}
        {!result && !error && (
          <div className="mt-8 rounded-xl border bg-white p-5 sm:p-6">
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">How to Use This Tracker</h3>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
              <li>Locate your <strong>Application Number</strong> from the confirmation email you received.</li>
              <li>Enter it above in the format <code className="rounded bg-gray-100 px-1">BP-YYYY-NNNNNN</code>.</li>
              <li>Click <strong>Track Application</strong> to view the real-time status.</li>
            </ol>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
