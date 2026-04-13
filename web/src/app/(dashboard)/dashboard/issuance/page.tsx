import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FileText, Printer, Download, CheckCircle } from "lucide-react";
import { IssuanceClient } from "./client";

export const metadata = { title: "Permit Issuance" };

export default async function IssuancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "STAFF" && session.user.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  // Get all permits with their issuance data
  const permits = await prisma.permit.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      permitNumber: true,
      businessName: true,
      ownerName: true,
      issueDate: true,
      expiryDate: true,
      status: true,
      applicationId: true,
      application: {
        select: {
          applicationNumber: true,
          applicant: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      issuance: {
        select: {
          id: true,
          status: true,
          issuedAt: true,
        },
      },
    },
  });

  // Calculate stats
  const stats = {
    readyToPrint: permits.filter(
      (p) => p.issuance?.status === "PREPARED"
    ).length,
    issued: permits.filter((p) => p.issuance?.status === "ISSUED").length,
    claimed: permits.filter(
      (p) => p.issuance?.status === "COMPLETED"
    ).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Permit Issuance</h1>
        <p className="mt-2 text-gray-600">
          Generate and manage business permits
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready to Print</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.readyToPrint}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Issued</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.issued}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <Printer className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Claimed</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.claimed}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <IssuanceClient permits={permits} />
    </div>
  );
}
