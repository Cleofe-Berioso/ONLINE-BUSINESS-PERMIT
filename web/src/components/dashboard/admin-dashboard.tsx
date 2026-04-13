"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TestTubes, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface AdminDashboardProps {
  totalApplications: number;
  pendingReview: number;
  approved: number;
  unscheduledClaims: number;
  monthlyData: Array<{ month: string; count: number }>;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  applicationsForReview: Array<{
    reference: string;
    applicant: string;
    business: string;
    type: string;
    date: string;
    status: string;
  }>;
}

export function AdminDashboard({
  totalApplications,
  pendingReview,
  approved,
  unscheduledClaims,
  monthlyData,
  statusBreakdown,
  applicationsForReview,
}: AdminDashboardProps) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await fetch("/api/admin/reports/export?type=applications");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleIssuePermit = () => {
    window.location.href = "/dashboard/issuance";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Overview of permit applications and business monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exportLoading ? "Exporting..." : "Export Report"}
          </Button>
          <Button
            onClick={handleIssuePermit}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <TestTubes className="h-4 w-4" />
            Issue Permit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TestTubes className="h-6 w-6 text-blue-600" />}
          label="Total Applications"
          value={totalApplications}
          trend="1.1% from last month"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<AlertCircle className="h-6 w-6 text-yellow-600" />}
          label="Pending Review"
          value={pendingReview}
          subtext="Requires attention"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          label="Approved"
          value={approved}
          trend="1.1% from last month"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-purple-600" />}
          label="Unscheduled Claims"
          value={unscheduledClaims}
          subtext="This week"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Applications for Review Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications for Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">REFERENCE</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">APPLICANT</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">BUSINESS</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">TYPE</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">DATE</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">STATUS</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {applicationsForReview.map((app) => (
                  <tr key={app.reference} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-blue-600 font-medium">{app.reference}</td>
                    <td className="px-4 py-3 text-gray-900">{app.applicant}</td>
                    <td className="px-4 py-3 text-gray-900">{app.business}</td>
                    <td className="px-4 py-3 text-gray-600">{app.type}</td>
                    <td className="px-4 py-3 text-gray-600">{app.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/dashboard/review?ref=${app.reference}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  subtext,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: string;
  subtext?: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {trend && <p className="mt-2 text-xs text-green-600">↑ {trend}</p>}
            {subtext && <p className="mt-2 text-xs text-gray-600">{subtext}</p>}
          </div>
          <div className={`rounded-lg ${bgColor} p-3`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    "Pending Review": "bg-yellow-100 text-yellow-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    "Pending Reviewer": "bg-orange-100 text-orange-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
