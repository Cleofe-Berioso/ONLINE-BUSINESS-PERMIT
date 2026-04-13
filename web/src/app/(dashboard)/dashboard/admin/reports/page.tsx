import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AdminReportsClient } from "@/components/dashboard/admin-reports-client";

export const metadata = { title: "Reports" };

const AVAILABLE_REPORTS = [
  {
    id: "monthly-applications",
    name: "Monthly Applications Summary",
    icon: "FileText",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    description: "Applications submitted this month",
    formats: ["PDF", "Excel"],
    lastGenerated: "Mar 1, 2026",
  },
  {
    id: "approved-licenses",
    name: "Approved Licenses Report",
    icon: "CheckCircle",
    color: "bg-green-50",
    iconColor: "text-green-600",
    description: "All approved permits issued",
    formats: ["PDF", "Excel"],
    lastGenerated: "Mar 1, 2026",
  },
  {
    id: "claim-schedule",
    name: "Claim Schedule Report",
    icon: "Calendar",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    description: "Claim slots and reservations",
    formats: ["PDF"],
    lastGenerated: "Feb 26, 2026",
  },
  {
    id: "business-locations",
    name: "Business Location Summary",
    icon: "MapPin",
    color: "bg-red-50",
    iconColor: "text-red-600",
    description: "Geospatial business distribution",
    formats: ["PDF", "Map"],
    lastGenerated: "Feb 20, 2026",
  },
  {
    id: "sms-delivery",
    name: "SMS Delivery Report",
    icon: "MessageSquare",
    color: "bg-cyan-50",
    iconColor: "text-cyan-600",
    description: "Notification delivery status",
    formats: ["Excel"],
    lastGenerated: "Mar 6, 2026",
  },
  {
    id: "qr-verification",
    name: "QR Verification Logs",
    icon: "QrCode",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    description: "QR code scans and validations",
    formats: ["Excel"],
    lastGenerated: "Feb 10, 2026",
  },
  {
    id: "audit-trail",
    name: "Audit Trail Export",
    icon: "Lock",
    color: "bg-yellow-50",
    iconColor: "text-yellow-600",
    description: "Complete activity logs",
    formats: ["Excel"],
    lastGenerated: "Mar 5, 2026",
  },
];

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATOR") redirect("/dashboard");

  // Get stats
  const [totalReports, totalDownloads, scheduledReports, sharedReports] =
    await Promise.all([
      prisma.permit.count(),
      prisma.document.count(),
      prisma.claimSchedule.count(),
      prisma.user.count(),
    ]);

  const stats = [
    {
      label: "Reports",
      value: totalReports,
      icon: "FileText",
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Downloads",
      value: totalDownloads,
      icon: "Download",
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Scheduled",
      value: scheduledReports,
      icon: "Calendar",
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Shared",
      value: sharedReports,
      icon: "Share2",
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <AdminReportsClient stats={stats} reports={AVAILABLE_REPORTS} />
  );
}
