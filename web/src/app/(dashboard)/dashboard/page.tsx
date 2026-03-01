import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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
          value="0"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          label="Under Review"
          value="0"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          label="Approved"
          value="0"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<XCircle className="h-6 w-6 text-red-600" />}
          label="Rejected"
          value="0"
          bgColor="bg-red-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {role === "APPLICANT" && (
            <>
              <QuickAction
                icon={<FileText className="h-5 w-5" />}
                title="New Application"
                description="Submit a new business permit application"
                href="/dashboard/applications/new"
              />
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
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg ${bgColor} p-3`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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
