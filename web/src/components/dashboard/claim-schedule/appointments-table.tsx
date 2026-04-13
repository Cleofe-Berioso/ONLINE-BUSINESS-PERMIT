"use client";

import { Button } from "@/components/ui/button";

interface Appointment {
  id: string;
  permitId: string;
  applicantName: string;
  businessName: string;
  date: string;
  time: string;
  location: string;
  status: "scheduled" | "completed" | "cancelled";
}

interface AppointmentsTableProps {
  appointments: Appointment[];
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  isLoading?: boolean;
}

export function AppointmentsTable({
  appointments,
  onComplete,
  onCancel,
  isLoading = false,
}: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <p className="text-sm text-gray-500">No appointments scheduled</p>
      </div>
    );
  }

  const getStatusColor = (
    status: "scheduled" | "completed" | "cancelled"
  ) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusLabel = (
    status: "scheduled" | "completed" | "cancelled"
  ) => {
    switch (status) {
      case "completed":
        return "Complete";
      case "cancelled":
        return "Cancel";
      default:
        return "Scheduled";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Permit ID
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Applicant
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Business
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Date & Time
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Location
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const date = new Date(appointment.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <tr
                key={appointment.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-blue-600">
                    {appointment.permitId}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900">{appointment.applicantName}</td>
                <td className="px-4 py-3 text-gray-700">{appointment.businessName}</td>
                <td className="px-4 py-3 text-gray-700">
                  <div>{date}</div>
                  <div className="text-xs text-gray-500">{appointment.time}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{appointment.location}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {getStatusLabel(appointment.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onComplete(appointment.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancel(appointment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status !== "scheduled" && (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
