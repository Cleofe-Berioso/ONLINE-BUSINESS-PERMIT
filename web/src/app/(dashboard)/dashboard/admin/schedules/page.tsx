"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck, Plus, Trash2 } from "lucide-react";

interface TimeSlotInput {
  startTime: string;
  endTime: string;
  maxCapacity: string;
}

interface ScheduleData {
  id: string;
  date: string;
  isBlocked: boolean;
  timeSlots: {
    id: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    currentCount: number;
    isActive: boolean;
  }[];
}

export default function AdminSchedulesPage() {  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newDate, setNewDate] = useState("");
  const [slots, setSlots] = useState<TimeSlotInput[]>([
    { startTime: "08:00", endTime: "09:00", maxCapacity: "20" },
    { startTime: "09:00", endTime: "10:00", maxCapacity: "20" },
    { startTime: "10:00", endTime: "11:00", maxCapacity: "20" },
    { startTime: "13:00", endTime: "14:00", maxCapacity: "20" },
    { startTime: "14:00", endTime: "15:00", maxCapacity: "20" },
  ]);

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

  const addSlot = () => {
    setSlots([...slots, { startTime: "", endTime: "", maxCapacity: "20" }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof TimeSlotInput, value: string) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleCreate = async () => {
    if (!newDate || slots.length === 0) {
      setError("Please enter a date and at least one time slot");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          timeSlots: slots.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            maxCapacity: parseInt(s.maxCapacity),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create schedule");
        return;
      }

      setSuccess("Schedule created successfully!");
      setShowForm(false);
      setNewDate("");
      fetchSchedules();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading schedules..." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Schedules</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure claiming dates and time slots for permit collection
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Create Schedule Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
            <CardDescription>Set up a new claiming date with time slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Date"
                name="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Time Slots
                  </label>
                  <Button variant="outline" size="sm" onClick={addSlot}>
                    <Plus className="h-3 w-3" /> Add Slot
                  </Button>
                </div>

                <div className="space-y-2">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateSlot(index, "startTime", e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-gray-400">to</span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateSlot(index, "endTime", e.target.value)
                        }
                        className="w-32"
                      />
                      <Input
                        type="number"
                        value={slot.maxCapacity}
                        onChange={(e) =>
                          updateSlot(index, "maxCapacity", e.target.value)
                        }
                        placeholder="Capacity"
                        className="w-24"
                      />
                      <span className="text-xs text-gray-400">slots</span>
                      {slots.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} loading={creating}>
                  Create Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Schedules */}
      {schedules.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-8 w-8 text-gray-400" />}
          title="No schedules created"
          description="Create claiming schedules for applicants to book time slots."
          action={{ label: "Create Schedule", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => {
            const date = new Date(schedule.date);
            const totalSlots = schedule.timeSlots.reduce(
              (sum, s) => sum + s.maxCapacity,
              0
            );
            const totalBooked = schedule.timeSlots.reduce(
              (sum, s) => sum + s.currentCount,
              0
            );

            return (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {date.toLocaleDateString("en-PH", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                    {schedule.isBlocked && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Blocked
                      </span>
                    )}
                  </div>

                  <div className="mb-3 text-sm text-gray-600">
                    {totalBooked}/{totalSlots} slots booked
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${totalSlots > 0 ? (totalBooked / totalSlots) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <ul className="mt-3 space-y-1">
                    {schedule.timeSlots.map((slot) => (
                      <li
                        key={slot.id}
                        className="flex items-center justify-between text-xs text-gray-500"
                      >
                        <span>
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span>
                          {slot.currentCount}/{slot.maxCapacity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
