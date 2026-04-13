import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DocumentsClient } from "@/components/dashboard/documents-client";
import { StatusBadge } from "@/components/ui/badge";
import type { Document } from "@prisma/client";

export const metadata = { title: "My Documents" };

interface DocumentWithApp extends Document {
  application: {
    applicationNumber: string;
    businessName: string;
  } | null;
}

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { uploadedBy: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      application: {
        select: { applicationNumber: true, businessName: true },
      },
    },
  }) as DocumentWithApp[];

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage all your uploaded documents
        </p>
      </div>

      {/* Upload Section - Client Component */}
      <DocumentsClient userId={session.user.id} />

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-sm text-gray-500">
            No documents uploaded yet. Use the upload zone above to get started.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Uploaded Documents
          </h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Document Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="h-6 w-6 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z" />
                    </svg>
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {doc.originalName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span>{doc.mimeType.split("/")[1].toUpperCase()}</span>
                      <span>•</span>
                      <span>{doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : "Unknown"}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(doc.createdAt)}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Application: {doc.application?.applicationNumber || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={doc.status} />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* View/Eye Icon */}
                    <button
                      title="View document"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>

                    {/* Download Icon */}
                    <button
                      title="Download document"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>

                    {/* Delete/Trash Icon */}
                    <button
                      title="Delete document"
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
