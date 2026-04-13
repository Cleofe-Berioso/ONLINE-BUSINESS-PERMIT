"use client";

import {
  FileText,
  Download,
  Calendar,
  Share2,
  CheckCircle,
  MapPin,
  MessageSquare,
  QrCode,
  Lock,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Download,
  Calendar,
  Share2,
  CheckCircle,
  MapPin,
  MessageSquare,
  QrCode,
  Lock,
};

interface Report {
  id: string;
  name: string;
  icon: string;
  color: string;
  iconColor: string;
  description: string;
  formats: string[];
  lastGenerated: string;
}

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
  iconColor: string;
}

interface Props {
  stats: Stat[];
  reports: Report[];
}

export function AdminReportsClient({ stats, reports }: Props) {
  const handleGenerateReport = (reportId: string) => {
    console.log("Generate report:", reportId);
    // TODO: Implement report generation
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">Generate and manage business reports</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = ICON_MAP[stat.icon];
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg ${stat.color} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Reports */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Available Reports
        </h2>
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white divide-y">
          {reports.map((report) => {
            const Icon = ICON_MAP[report.icon];
            return (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`rounded-lg ${report.color} p-3 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${report.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {report.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Last {report.lastGenerated}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {report.formats.map((format) => (
                        <span
                          key={format}
                          className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateReport(report.id)}
                  className="flex-shrink-0 ml-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Generate
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
