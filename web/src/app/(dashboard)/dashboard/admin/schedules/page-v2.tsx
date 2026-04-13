"use client";

import { useState } from "react";
import { Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { CalendarComponent } from "@/components/dashboard/claim-schedule/calendar";
import { BlockedDatesList } from "@/components/dashboard/claim-schedule/blocked-dates-list";
import { AppointmentsTable } from "@/components/dashboard/claim-schedule/appointments-table";
import { BlockDateModal } from "@/components/dashboard/claim-schedule/block-date-modal";
import {
  useScheduleData,
  useBlockDate,
  useRemoveBlockedDate,
  useUpdateAppointmentStatus,
} from "@/hooks/use-schedule";

export default function ClaimScheduleManagementPage() {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Data fetching with React Query (auto-refresh every 30 seconds)
  const {
    data: scheduleData,
    isLoading,
    error: fetchError,
  } = useScheduleData();

  // Mutations
  const blockDate = useBlockDate();
  const removeBlockedDate = useRemoveBlockedDate();
  const updateAppointmentStatus = useUpdateAppointmentStatus();

  const handleBlockDate = async (date: string, reason: string) => {
    try {
      await blockDate.mutateAsync({ date, reason });
      setShowBlockModal(false);
    } catch (error) {
      console.error("Failed to block date:", error);
    }
  };

  const handleRemoveBlockedDate = async (dateId: string) => {
    try {
      await removeBlockedDate.mutateAsync(dateId);
    } catch (error) {
      console.error("Failed to remove blocked date:", error);
    }
  };

  const handleAppointmentAction = async (
    appointmentId: string,
    action: "complete" | "cancel"
  ) => {
    try {
      await updateAppointmentStatus.mutateAsync({
        appointmentId,
        status: action === "complete" ? "completed" : "cancelled",
      });
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading schedule..." />
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="space-y-4">
        <Alert variant="error">
          {fetchError instanceof Error
            ? fetchError.message
            : "Failed to load schedule data"}
        </Alert>
      </div>
    );
  }

  const stats = scheduleData?.stats || {
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  };
  const blockedDates = scheduleData?.blockedDates || [];
  const appointments = scheduleData?.appointments || [];

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
          disabled={blockDate.isPending}
        >
          Block Date
        </Button>
      </div>

      {/* Error Messages */}
      {blockDate.error && (
        <Alert variant="error" onClose={() => blockDate.reset()}>
          {blockDate.error instanceof Error ? blockDate.error.message : "Failed to block date"}
        </Alert>
      )}
      {removeBlockedDate.error && (
        <Alert
          variant="error"
          onClose={() => removeBlockedDate.reset()}
        >
          {removeBlockedDate.error instanceof Error
            ? removeBlockedDate.error.message
            : "Failed to remove blocked date"}
        </Alert>
      )}
      {updateAppointmentStatus.error && (
        <Alert
          variant="error"
          onClose={() => updateAppointmentStatus.reset()}
        >
          {updateAppointmentStatus.error instanceof Error
            ? updateAppointmentStatus.error.message
            : "Failed to update appointment"}
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
              isLoading={removeBlockedDate.isPending}
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
            isLoading={updateAppointmentStatus.isPending}
          />
        </CardContent>
      </Card>

      {/* Block Date Modal */}
      {showBlockModal && (
        <BlockDateModal
          onClose={() => setShowBlockModal(false)}
          onSubmit={handleBlockDate}
          isLoading={blockDate.isPending}
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
