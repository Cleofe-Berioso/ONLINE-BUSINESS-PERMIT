import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { cacheOrCompute, CacheKeys, CacheTTL } from "@/lib/cache";
import {
  canStartNewApplication,
  getRenewalEligibility,
  checkClosureEligibility,
} from "@/lib/application-helpers";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { role, firstName } = session.user;
  // Build filter: APPLICANT sees only their own; staff/admin see all
  const whereClause =
    role === "APPLICANT" ? { applicantId: session.user.id } : {};

  // Cache dashboard stats per role (2 min TTL)
  const cacheKey = CacheKeys.dashboardStats(
    role === "APPLICANT" ? session.user.id : role
  );

  const stats = await cacheOrCompute(
    cacheKey,
    async () => {
      const [total, under, app, rej] = await Promise.all([
        prisma.application.count({ where: whereClause }),
        prisma.application.count({ where: { ...whereClause, status: "UNDER_REVIEW" } }),
        prisma.application.count({ where: { ...whereClause, status: "APPROVED" } }),
        prisma.application.count({ where: { ...whereClause, status: "REJECTED" } }),
      ]);
      return { total, under, app, rej };
    },
    CacheTTL.SHORT
  );

  const { total: totalApplications, under: underReview, app: approved, rej: rejected } = stats;

  // APPLICANT-specific: Load business contexts and compute eligibility per context
  let applicantContextData: {
    canStartNew: boolean;
    renewalEligibleCount: number;
    closureEligibleCount: number;
  } | null = null;

  if (role === "APPLICANT") {
    const [userPermits, pendingNewApps] = await Promise.all([
      prisma.permit.findMany({
        where: {
          application: { applicantId: session.user.id },
        },
        select: {
          id: true,
          application: {
            select: {
              dtiSecRegistration: true,
            },
          },
        },
      }),
      prisma.application.findMany({
        where: {
          applicantId: session.user.id,
          type: "NEW",
          status: { in: ["DRAFT", "SUBMITTED"] },
        },
        select: {
          dtiSecRegistration: true,
        },
      }),
    ]);

    // Can start NEW if no pending NEW applications exist
    const canStartNew = pendingNewApps.length === 0;

    // Count renewal and closure eligible permits
    const renewalChecks = await Promise.all(
      userPermits.map((p) => getRenewalEligibility(session.user.id, p.id))
    );
    const renewalEligibleCount = renewalChecks.filter((r) => r.isEligible).length;

    const closureChecks = await Promise.all(
      userPermits.map((p) => checkClosureEligibility(session.user.id, p.id))
    );
    const closureEligibleCount = closureChecks.filter((c) => c.isEligible).length;

    applicantContextData = {
      canStartNew,
      renewalEligibleCount,
      closureEligibleCount,
    };
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {role === "APPLICANT"
            ? "Manage your business permit applications and track their status."
            : role === "STAFF"
            ? "Review applications and manage permit issuances."
            : role === "REVIEWER"
            ? "Review and approve or reject permit applications."
            : "Manage the entire permit system, users, schedules, and reports."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-6 w-6 text-blue-600" />}
          label="Total Applications"
          value={totalApplications.toString()}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          label="Under Review"
          value={underReview.toString()}
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          label="Approved"
          value={approved.toString()}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<XCircle className="h-6 w-6 text-red-600" />}
          label="Rejected"
          value={rejected.toString()}
          bgColor="bg-red-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {role === "APPLICANT" && (
            <>
              {applicantContextData?.canStartNew && (
                <QuickAction
                  icon={<FileText className="h-5 w-5" />}
                  title="New Application"
                  description="Submit a new business permit application"
                  href="/dashboard/applications/new"
                />
              )}
              {applicantContextData && applicantContextData.renewalEligibleCount > 0 && (
                <QuickAction
                  icon={<FileText className="h-5 w-5" />}
                  title="Renew Permit"
                  description={`${applicantContextData.renewalEligibleCount} permit${applicantContextData.renewalEligibleCount !== 1 ? 's' : ''} eligible for renewal`}
                  href="/dashboard/renew"
                />
              )}
              {applicantContextData && applicantContextData.closureEligibleCount > 0 && (
                <QuickAction
                  icon={<FileText className="h-5 w-5" />}
                  title="Close Business"
                  description={`${applicantContextData.closureEligibleCount} permit${applicantContextData.closureEligibleCount !== 1 ? 's' : ''} eligible for closure`}
                  href="/dashboard/applications/closure"
                />
              )}
              <QuickAction
                icon={<Clock className="h-5 w-5" />}
                title="Track Application"
                description="Check the status of your applications"
                href="/dashboard/tracking"
              />
              <QuickAction
                icon={<CalendarCheck className="h-5 w-5" />}
                title="Schedule Claiming"
                description="Book a time slot to claim your permit"
                href="/dashboard/schedule"
              />
            </>
          )}
          {(role === "STAFF" || role === "REVIEWER") && (
            <>
              <QuickAction
                icon={<AlertCircle className="h-5 w-5" />}
                title="Pending Reviews"
                description="View applications awaiting review"
                href="/dashboard/review"
              />
              <QuickAction
                icon={<CalendarCheck className="h-5 w-5" />}
                title="Today's Claims"
                description="View claiming schedule for today"
                href="/dashboard/claims"
              />
            </>
          )}
          {role === "ADMINISTRATOR" && (
            <>
              <QuickAction
                icon={<AlertCircle className="h-5 w-5" />}
                title="Pending Reviews"
                description="View all applications awaiting review"
                href="/dashboard/review"
              />
              <QuickAction
                icon={<CalendarCheck className="h-5 w-5" />}
                title="Manage Schedules"
                description="Configure claiming dates and time slots"
                href="/dashboard/admin/schedules"
              />
              <QuickAction
                icon={<FileText className="h-5 w-5" />}
                title="Generate Reports"
                description="View and export system reports"
                href="/dashboard/admin/reports"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}) {  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`rounded-lg ${bgColor} p-2.5 sm:p-3`}>{icon}</div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="rounded-lg bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-100">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </a>
  );
}
