"use client";

import { useState, useEffect } from "react";
import { Calendar, X, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { CalendarComponent } from "@/components/dashboard/claim-schedule/calendar";
import { BlockedDatesList } from "@/components/dashboard/claim-schedule/blocked-dates-list";
import { AppointmentsTable } from "@/components/dashboard/claim-schedule/appointments-table";
import { BlockDateModal } from "@/components/dashboard/claim-schedule/block-date-modal";

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentCount: number;
}

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

interface Stats {
  scheduled: number;
  completed: number;
  cancelled: number;
}

export default function ClaimScheduleManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [stats, setStats] = useState<Stats>({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/schedules");
      const data = await res.json();

      if (res.ok) {
        setStats(data.stats || { scheduled: 0, completed: 0, cancelled: 0 });
        setBlockedDates(data.blockedDates || []);
        setAppointments(data.appointments || []);
      } else {
        setError(data.error || "Failed to load schedule data");
      }
    } catch (err) {
      setError("Failed to load schedule data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlockedDate = async (dateId: string) => {
    try {
      const res = await fetch(`/api/admin/schedules/blocked-dates/${dateId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBlockedDates(blockedDates.filter((d) => d.id !== dateId));
        setSuccess("Blocked date removed successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to remove blocked date");
      }
    } catch (err) {
      setError("Failed to remove blocked date");
      console.error(err);
    }
  };

  const handleBlockDate = async (date: string, reason: string) => {
    try {
      const res = await fetch("/api/admin/schedules/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reason }),
      });

      const data = await res.json();

      if (res.ok) {
        setBlockedDates([...blockedDates, data.blockedDate]);
        setShowBlockModal(false);
        setSuccess("Date blocked successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to block date");
      }
    } catch (err) {
      setError("Failed to block date");
      console.error(err);
    }
  };

  const handleAppointmentAction = async (
    appointmentId: string,
    action: "complete" | "cancel"
  ) => {
    try {
      const res = await fetch(
        `/api/admin/schedules/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: action === "complete" ? "completed" : "cancelled" }),
        }
      );

      if (res.ok) {
        setAppointments(
          appointments.map((apt) =>
            apt.id === appointmentId
              ? {
                  ...apt,
                  status: action === "complete" ? "completed" : "cancelled",
                }
              : apt
          )
        );

        // Update stats
        setStats((prev) => {
          const newStats = { ...prev };
          if (appointments.find((a) => a.id === appointmentId)?.status === "scheduled") {
            newStats.scheduled = Math.max(0, newStats.scheduled - 1);
            newStats[action === "complete" ? "completed" : "cancelled"]++;
          }
          return newStats;
        });

        setSuccess(
          `Appointment ${action === "complete" ? "completed" : "cancelled"} successfully`
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to update appointment");
      }
    } catch (err) {
      setError("Failed to update appointment");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading schedule..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claim Schedule Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage claim appointments and block unavailable dates
          </p>
        </div>
        <Button
          onClick={() => setShowBlockModal(true)}
          className="w-full sm:w-auto"
        >
          Block Date
        </Button>
      </div>

      {/* Error & Success Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={<Calendar className="h-6 w-6" />}
          label="Scheduled"
          value={stats.scheduled}
          variant="blue"
        />
        <StatsCard
          icon={<CheckCircle className="h-6 w-6" />}
          label="Completed"
          value={stats.completed}
          variant="green"
        />
        <StatsCard
          icon={<XCircle className="h-6 w-6" />}
          label="Cancelled"
          value={stats.cancelled}
          variant="red"
        />
      </div>

      {/* Calendar & Blocked Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Appointment Calendar</CardTitle>
            <CardDescription>View appointments and manage blocked dates</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              blockedDates={blockedDates}
              onDateSelect={setSelectedDate}
            />
          </CardContent>
        </Card>

        {/* Blocked Dates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Blocked Dates</CardTitle>
            <CardDescription>Dates marked as unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <BlockedDatesList
              blockedDates={blockedDates}
              onRemove={handleRemoveBlockedDate}
            />
          </CardContent>
        </Card>
      </div>

      {/* All Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Appointments</CardTitle>
          <CardDescription>Manage all scheduled claim appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentsTable
            appointments={appointments}
            onComplete={(id) => handleAppointmentAction(id, "complete")}
            onCancel={(id) => handleAppointmentAction(id, "cancel")}
          />
        </CardContent>
      </Card>

      {/* Block Date Modal */}
      {showBlockModal && (
        <BlockDateModal
          onClose={() => setShowBlockModal(false)}
          onSubmit={handleBlockDate}
        />
      )}
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: "blue" | "green" | "red";
}

function StatsCard({ icon, label, value, variant }: StatsCardProps) {
  const variantStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`rounded-lg p-3 ${variantStyles[variant]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
