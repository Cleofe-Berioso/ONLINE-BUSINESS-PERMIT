import { z } from "zod";

// Block Date
export const blockDateSchema = z.object({
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
});

export type BlockDateInput = z.infer<typeof blockDateSchema>;

// Update Appointment Status
export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["completed", "cancelled"]),
});

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;

// Query Params
export const appointmentsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default("1"),
  limit: z.string().regex(/^\d+$/).optional().default("10"),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
});

export type AppointmentsQueryParams = z.infer<typeof appointmentsQuerySchema>;
