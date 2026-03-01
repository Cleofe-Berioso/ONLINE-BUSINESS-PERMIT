import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";

export const metadata = { title: "Application Details" };

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      history: { orderBy: { createdAt: "desc" } },
      reviewActions: {
        orderBy: { createdAt: "desc" },
        include: { reviewer: { select: { firstName: true, lastName: true } } },
      },
      permit: true,
      claimReference: true,
      claimSchedule: { include: { timeSlot: true } },
    },
  });

  if (!application) notFound();

  // Only the applicant or staff/admin can view
  if (
    session.user.role === "APPLICANT" &&
    application.applicantId !== session.user.id
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/applications"
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {application.applicationNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {application.businessName}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Business Name</dt>
                  <dd className="font-medium text-gray-900">
                    {application.businessName}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Business Type</dt>
                  <dd className="font-medium text-gray-900">
                    {application.businessType}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Address</dt>
                  <dd className="font-medium text-gray-900">
                    {[
                      application.businessAddress,
                      application.businessBarangay,
                      application.businessCity,
                      application.businessProvince,
                      application.businessZipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
                {application.tinNumber && (
                  <div>
                    <dt className="text-gray-500">TIN</dt>
                    <dd className="font-medium text-gray-900">
                      {application.tinNumber}
                    </dd>
                  </div>
                )}
                {application.dtiSecRegistration && (
                  <div>
                    <dt className="text-gray-500">DTI/SEC No.</dt>
                    <dd className="font-medium text-gray-900">
                      {application.dtiSecRegistration}
                    </dd>
                  </div>
                )}
                {application.capitalInvestment && (
                  <div>
                    <dt className="text-gray-500">Capital Investment</dt>
                    <dd className="font-medium text-gray-900">
                      {formatCurrency(Number(application.capitalInvestment))}
                    </dd>
                  </div>
                )}
                {application.numberOfEmployees && (
                  <div>
                    <dt className="text-gray-500">Employees</dt>
                    <dd className="font-medium text-gray-900">
                      {application.numberOfEmployees}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents ({application.documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded.</p>
              ) : (
                <ul className="divide-y">
                  {application.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {doc.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.documentType} · v{doc.version}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Review Actions */}
          {application.reviewActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {application.reviewActions.map((ra) => (
                    <li
                      key={ra.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {ra.reviewer.firstName} {ra.reviewer.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(ra.createdAt)}
                        </span>
                      </div>
                      <StatusBadge status={ra.action} />
                      {ra.comment && (
                        <p className="mt-2 text-sm text-gray-600">
                          {ra.comment}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 pl-6">
                {application.history.map((h) => (
                  <li key={h.id} className="mb-6 last:mb-0">
                    <span className="absolute -left-2 h-4 w-4 rounded-full border-2 border-white bg-blue-600" />
                    <p className="text-sm font-medium text-gray-900">
                      {h.newStatus.replace(/_/g, " ")}
                    </p>
                    {h.comment && (
                      <p className="mt-0.5 text-xs text-gray-500">{h.comment}</p>
                    )}
                    <time className="text-xs text-gray-400">
                      {formatDateTime(h.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <dt className="text-gray-500">Filed:</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDate(application.createdAt)}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <dt className="text-gray-500">Type:</dt>
                  <dd>
                    <StatusBadge status={application.type} />
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Actions for staff */}
          {(session.user.role === "STAFF" ||
            session.user.role === "REVIEWER" ||
            session.user.role === "ADMINISTRATOR") &&
            application.status === "SUBMITTED" && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href={`/dashboard/review/${application.id}`}>
                      <Button className="w-full">Review Application</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Claim info */}
          {application.status === "APPROVED" &&
            !application.claimSchedule &&
            session.user.role === "APPLICANT" && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Claiming</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-gray-600">
                    Your application is approved! Schedule a time to claim your
                    permit.
                  </p>
                  <Link href={`/dashboard/schedule?applicationId=${application.id}`}>
                    <Button className="w-full">Schedule Now</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

          {/* Permit info */}
          {application.permit && (
            <Card>
              <CardHeader>
                <CardTitle>Permit</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Permit No.</dt>
                    <dd className="font-medium text-gray-900">
                      {application.permit.permitNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Status</dt>
                    <dd>
                      <StatusBadge status={application.permit.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Issued</dt>
                    <dd className="text-gray-900">
                      {formatDate(application.permit.issueDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Expires</dt>
                    <dd className="text-gray-900">
                      {formatDate(application.permit.expiryDate)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
