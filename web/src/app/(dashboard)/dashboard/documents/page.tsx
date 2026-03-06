import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { FileText, Image as ImageIcon, Upload } from "lucide-react";

export const metadata = { title: "My Documents" };

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
  });

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-red-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          View all documents you&apos;ve uploaded across your applications
        </p>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={<Upload className="h-8 w-8 text-gray-400" />}
          title="No documents uploaded"
          description="Documents will appear here once you upload them with your applications."
          action={{
            label: "New Application",
            href: "/dashboard/applications/new",
          }}
        />      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Mobile cards */}
            <div className="divide-y md:hidden">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex-shrink-0">{getIcon(doc.mimeType)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800 text-sm">{doc.originalName}</p>
                    <p className="text-xs text-gray-500">{doc.application.applicationNumber} · {formatSize(doc.fileSize)}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{doc.documentType.replace(/_/g, " ")} · v{doc.version}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <StatusBadge status={doc.status} />
                      <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Document</th>
                    <th className="px-4 py-3 font-semibold">Application</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Version</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getIcon(doc.mimeType)}
                          <div>
                            <p className="font-medium text-gray-700">{doc.originalName}</p>
                            <p className="text-xs text-gray-400">{formatSize(doc.fileSize)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{doc.application.applicationNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{doc.documentType.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-gray-600">v{doc.version}</td>
                      <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(doc.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
