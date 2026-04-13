"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ScheduleData {
  stats: {
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  blockedDates: Array<{
    id: string;
    date: string;
    reason: string;
  }>;
  appointments: Array<{
    id: string;
    permitId: string;
    applicantName: string;
    businessName: string;
    date: string;
    time: string;
    location: string;
    status: "scheduled" | "completed" | "cancelled";
  }>;
}

/**
 * Hook to fetch schedule data
 */
export function useScheduleData() {
  return useQuery<ScheduleData>({
    queryKey: ["admin", "schedules"],
    queryFn: async () => {
      const res = await fetch("/api/admin/schedules");
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Data is fresh for 10 seconds
  });
}

/**
 * Hook to block a date
 */
export function useBlockDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, reason }: { date: string; reason: string }) => {
      const res = await fetch("/api/admin/schedules/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to block date");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch schedule data
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
    },
  });
}

/**
 * Hook to remove a blocked date
 */
export function useRemoveBlockedDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dateId: string) => {
      const res = await fetch(
        `/api/admin/schedules/blocked-dates/${dateId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove blocked date");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
    },
  });
}

/**
 * Hook to update appointment status
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: {
      appointmentId: string;
      status: "completed" | "cancelled";
    }) => {
      const res = await fetch(
        `/api/admin/schedules/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update appointment");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
    },
  });
}
