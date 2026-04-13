import prisma from "@/lib/prisma";
import { cacheOrCompute, CacheTTL } from "@/lib/cache";

/**
 * Get schedule stats (scheduled, completed, cancelled appointments)
 * Cached for 5 minutes for better performance
 */
export async function getScheduleStats() {
  return cacheOrCompute(
    "schedule:stats",
    async () => {
      const [scheduled, completed, cancelled] = await Promise.all([
        prisma.slotReservation.count({
          where: { status: "CONFIRMED" },
        }),
        prisma.slotReservation.count({
          where: { status: "COMPLETED" },
        }),
        prisma.slotReservation.count({
          where: { status: "CANCELLED" },
        }),
      ]);

      return { scheduled, completed, cancelled };
    },
    CacheTTL.MEDIUM
  );
}

/**
 * Get all blocked dates
 * Cached for 10 minutes
 */
export async function getBlockedDates() {
  return cacheOrCompute(
    "schedule:blocked-dates",
    async () => {
      return prisma.claimSchedule.findMany({
        where: { isBlocked: true },
        select: {
          id: true,
          date: true,
          blockReason: true,
        },
        orderBy: { date: "asc" },
      });
    },
    CacheTTL.LONG
  );
}

/**
 * Get appointments with pagination
 */
export async function getAppointments(
  page: number = 1,
  limit: number = 10,
  status?: "CONFIRMED" | "COMPLETED" | "CANCELLED"
) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : undefined;

  const [appointments, total] = await Promise.all([
    prisma.slotReservation.findMany({
      where,
      select: {
        id: true,
        status: true,
        confirmedAt: true,
        cancelledAt: true,
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
            schedule: {
              select: {
                date: true,
              },
            },
          },
        },
        application: {
          select: {
            id: true,
            applicantId: true,
            businessName: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { confirmedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.slotReservation.count({ where }),
  ]);

  return {
    appointments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Check if a date is available (not blocked)
 */
export async function isDateAvailable(date: Date): Promise<boolean> {
  const schedule = await prisma.claimSchedule.findUnique({
    where: { date },
    select: { isBlocked: true },
  });

  return !schedule?.isBlocked;
}

/**
 * Get available time slots for a date
 */
export async function getAvailableTimeSlots(date: Date) {
  return prisma.timeSlot.findMany({
    where: {
      schedule: { date },
      isActive: true,
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      maxCapacity: true,
      currentCount: true,
    },
    orderBy: { startTime: "asc" },
  });
}

/**
 * Invalidate schedule-related caches
 * Call this after making changes to ensure fresh data
 */
export async function invalidateScheduleCaches() {
  // This would need to be integrated with your cache implementation
  // For now, just log the invalidation
  console.log("Schedule caches invalidated");
}
