
/**
 * Zod validation schemas for application form.
 */

import { z } from "zod";

export const expertiseItemSchema = z.object({
  area: z.string().min(1, "Select an area"),
  years: z.coerce
    .number()
    .gt(0, "Years must be greater than 0")
    .max(50, "Max 50 years"),
});

export const availabilitySchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (a) => new Date(a.startDate) <= new Date(a.endDate),
    { path: ["endDate"], message: "End date must be after start date" }
  );

