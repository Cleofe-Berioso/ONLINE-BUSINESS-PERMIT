"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { CalendarCheck, Clock, Users } from "lucide-react";

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

export default function SchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      if (res.ok) {
        setSchedules(data.schedules || []);
      }
    } catch {
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedSlot || !applicationId) {
      setError("Please select a time slot and ensure you have an application");
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

      setSuccess("Time slot reserved successfully! Please confirm within 15 minutes.");
      setTimeout(() => {
        router.push("/dashboard/claim-reference");
      }, 2000);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSchedule = schedules.find((s) => s.date === selectedDate);
  const availableSlots = selectedSchedule?.timeSlots.filter(
    (s) => s.isActive && s.currentCount < s.maxCapacity
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading available schedules..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Claiming</h1>
        <p className="mt-1 text-sm text-gray-600">
          Select your preferred date and time slot to claim your approved permit
        </p>
      </div>

      {!applicationId && (
        <Alert variant="warning" className="mb-6">
          Please select an approved application first. Go to{" "}          <Link href="/dashboard/applications" className="font-medium underline">
            My Applications
          </Link>{" "}
          to choose one.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Date Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-600" />
            Select Date
          </CardTitle>
          <CardDescription>Choose an available claiming date</CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-sm text-gray-500">
              No claiming schedules available at this time. Please check back later.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {schedules
                .filter((s) => !s.isBlocked)
                .map((schedule) => {
                  const date = new Date(schedule.date);
                  const hasAvailable = schedule.timeSlots.some(
                    (s) => s.isActive && s.currentCount < s.maxCapacity
                  );

                  return (
                    <button
                      key={schedule.id}
                      disabled={!hasAvailable}
                      onClick={() => {
                        setSelectedDate(schedule.date);
                        setSelectedSlot(null);
                      }}
                      className={`rounded-lg border-2 p-3 text-center transition-colors ${
                        selectedDate === schedule.date
                          ? "border-blue-600 bg-blue-50"
                          : hasAvailable
                          ? "border-gray-200 hover:border-blue-300"
                          : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-50"
                      }`}
                    >
                      <p className="text-lg font-bold text-gray-900">
                        {date.getDate()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {date.toLocaleDateString("en-PH", {
                          month: "short",
                          weekday: "short",
                        })}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {hasAvailable ? "Available" : "Full"}
                      </p>
                    </button>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      {selectedDate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Select Time Slot
            </CardTitle>
            <CardDescription>
              Choose an available time slot for{" "}
              {new Date(selectedDate).toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableSlots && availableSlots.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {availableSlots.map((slot) => {
                  const remaining = slot.maxCapacity - slot.currentCount;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`flex items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                        selectedSlot === slot.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">
                          {slot.startTime} – {slot.endTime}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {remaining} slot{remaining !== 1 ? "s" : ""} remaining
                        </div>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          selectedSlot === slot.id
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No available time slots for this date.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirm */}
      {selectedSlot && applicationId && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSlot(null);
              setSelectedDate(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleReserve} loading={submitting}>
            Confirm Reservation
          </Button>
        </div>
      )}
    </div>
  );
}
