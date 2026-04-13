"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { CalendarCheck, Clock, MapPin, AlertCircle, X } from "lucide-react";

interface TimeSlotData {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentCount: number;
  isActive: boolean;
}

interface ScheduleData {
  id: string;
  date: string;
  isBlocked: boolean;
  timeSlots: TimeSlotData[];
}

interface UpcomingAppointment {
  id: string;
  referenceNumber: string;
  businessName: string;
  status: "scheduled" | "completed" | "cancelled";
  date: string;
  time: string;
  location: string;
  timeSlotId: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ClaimSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, appointmentsRes] = await Promise.all([
        fetch("/api/schedules"),
        fetch("/api/claims/today")
      ]);

      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        setSchedules(data.schedules || []);
      }

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setUpcomingAppointments(data.appointments || []);
      }
    } catch {
      setError("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedSlot || !applicationId) {
      setError("Please select a time slot");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/schedules/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSlotId: selectedSlot,
          applicationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reserve slot");
        return;
      }

      setSuccess("Appointment scheduled successfully!");
      setTimeout(() => {
        router.push("/dashboard/claim-reference");
      }, 2000);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`/api/claims/${appointmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUpcomingAppointments(prev => prev.filter(a => a.id !== appointmentId));
      } else {
        setError("Failed to cancel appointment");
      }
    } catch {
      setError("An error occurred while cancelling");
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const schedule = schedules.find(s => s.date === dateStr);
    return schedule?.isBlocked || false;
  };

  const isDateScheduled = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return schedules.some(s => s.date === dateStr && !s.isBlocked);
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getDateStatus = (date: Date) => {
    if (isDateBlocked(date)) return "unavailable";
    if (isWeekend(date)) return "weekend";
    if (isDateScheduled(date)) return "scheduled";
    return "available";
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = Array(firstDay).fill(null);

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="rounded p-1 hover:bg-gray-100"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="rounded p-1 hover:bg-gray-100"
            >
              →
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAYS.map((day) => (
            <div key={day} className="text-xs font-semibold text-gray-600 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = date.toISOString().split("T")[0];
            const status = getDateStatus(date);
            const isSelected = selectedDate === dateStr;

            const statusColors = {
              scheduled: "bg-pink-100 text-pink-900 border-pink-300",
              unavailable: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
              weekend: "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed",
              available: "bg-white text-gray-900 border-gray-200 hover:border-blue-300",
            };

            return (
              <button
                key={day}
                onClick={() => status !== "unavailable" && status !== "weekend" && setSelectedDate(dateStr)}
                disabled={status === "unavailable" || status === "weekend"}
                className={`h-8 rounded border flex items-center justify-center text-xs font-semibold transition-colors ${
                  isSelected ? "border-blue-600 bg-blue-100 text-blue-900" : statusColors[status]
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-pink-100 border border-pink-300" />
            <span className="text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-100 border border-gray-200" />
            <span className="text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-white border border-gray-200" />
            <span className="text-gray-600">Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border-2 border-blue-600 bg-blue-100" />
            <span className="text-gray-600">Selected</span>
          </div>
        </div>
      </div>
    );
  };

  const selectedSchedule = schedules.find((s) => s.date === selectedDate);
  const availableSlots = selectedSchedule?.timeSlots.filter(
    (s) => s.isActive && s.currentCount < s.maxCapacity
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading schedules..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Claim Schedule</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your permit claim appointments
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Calendar & Time Slots */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Claim Date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
                Select Claim Date
              </CardTitle>
              <CardDescription>
                Choose an available date to view or schedule your permit claim
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCalendar()}
            </CardContent>
          </Card>

          {/* Time Slot Selection */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Available Time Slots
                </CardTitle>
                <CardDescription>
                  Select a time slot for{" "}
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableSlots && availableSlots.length > 0 ? (
                  <>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedSlot === slot.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {slot.startTime} – {slot.endTime}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {slot.maxCapacity - slot.currentCount} slot{(slot.maxCapacity - slot.currentCount) !== 1 ? "s" : ""} available
                            </p>
                          </div>
                          <div
                            className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                              selectedSlot === slot.id
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                      </button>
                    ))}

                    {selectedSlot && applicationId && (
                      <div className="pt-4 flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedSlot(null);
                            setSelectedDate(null);
                          }}
                        >
                          Clear Selection
                        </Button>
                        <Button
                          onClick={handleReserve}
                          loading={submitting}
                          className="flex-1"
                        >
                          Confirm Appointment
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 py-4">
                    No available time slots for this date. Please choose another date.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Upcoming Appointments */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
                Upcoming
              </CardTitle>
              <CardDescription>
                Your scheduled claim appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {appointment.referenceNumber}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {appointment.businessName}
                          </p>
                        </div>
                        <Badge
                          variant={
                            appointment.status === "scheduled"
                              ? "success"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {appointment.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          📅 {new Date(appointment.date).toLocaleDateString("en-PH")}
                        </div>
                        <div className="flex items-center gap-2">
                          🕐 {appointment.time}
                        </div>
                        <div className="flex items-start gap-2">
                          📍 {appointment.location}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="w-full mt-2 text-xs font-semibold text-red-600 hover:text-red-700 py-2 text-center"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4">
                  No upcoming appointments. Schedule one using the calendar.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Important Reminders */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertCircle className="h-5 w-5" />
            Important Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-orange-900">
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Claim appointments are available Monday to Friday only</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Please arrive 15 minutes before your scheduled time</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Bring a valid ID and your application reference number</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Red marked dates are unavailable due to holidays or maintenance</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">•</span>
              <span>Contact the office at least 24 hours in advance to reschedule</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
