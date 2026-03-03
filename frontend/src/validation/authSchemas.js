
/**
 * Zod validation schemas for authentication-related forms.
 */

import { z } from "zod";

/**
 * Common reusable rules
 */
export const usernameSchema = z
  .string()
  .min(1, "Please enter a username")
  .min(3, "Username must be at least 3 characters");

export const passwordSchema = z
  .string()
  .min(1, "Please enter a password")
  .min(6, "Password must be at least 6 characters");

export const emailSchema = z
  .string()
  .min(1, "Please enter an email address")
  .email("Please enter a valid email address");

export const pnrSchema = z
  .string()
  .min(1, "Please enter your personal number")
  .regex(/^\d{8}-\d{4}$/, "Use format YYYYMMDD-XXXX");

/**
 * Full form schemas
 */
export const registerSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  surname: z.string().min(1, "Please enter your surname"),
  email: emailSchema,
  pnr: pnrSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Please enter your username"),
  password: z.string().min(1, "Please enter your password"),
});

export const claimRequestSchema = z.object({
  email: emailSchema,
});

export const claimAccountSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});