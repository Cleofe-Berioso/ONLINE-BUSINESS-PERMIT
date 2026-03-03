import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { Tag } from "lucide-react";

export const metadata = { title: "Claim References" };

export default async function ClaimReferencePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // APPLICANT sees only their own references; staff/admin see all
  const whereClause =
    session.user.role === "APPLICANT"
      ? { generatedBy: session.user.id }
      : {};

  const references = await prisma.claimReference.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      application: {
        select: { applicationNumber: true, businessName: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claim References</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your claim reference numbers for permit collection
        </p>
      </div>

      {references.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-8 w-8 text-gray-400" />}
          title="No claim references yet"
          description="Claim references will be generated when you schedule a claiming appointment."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {references.map((ref) => (
            <Card key={ref.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {ref.application.businessName}
                  </CardTitle>
                  <StatusBadge status={ref.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <code className="flex-1 text-lg font-bold text-blue-700">
                      {ref.referenceNumber}
                    </code>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Application</dt>
                      <dd className="font-medium text-gray-700">
                        {ref.application.applicationNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Applicant</dt>
                      <dd className="font-medium text-gray-700">
                        {ref.applicantName}
                      </dd>
                    </div>
                    {ref.claimScheduleDate && (
                      <div>
                        <dt className="text-gray-500">Claim Date</dt>
                        <dd className="font-medium text-gray-700">
                          {formatDate(ref.claimScheduleDate)}
                        </dd>
                      </div>
                    )}
                    {ref.claimScheduleTime && (
                      <div>
                        <dt className="text-gray-500">Time</dt>
                        <dd className="font-medium text-gray-700">
                          {ref.claimScheduleTime}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-gray-500">Generated</dt>
                      <dd className="font-medium text-gray-700">
                        {formatDate(ref.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
