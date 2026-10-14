import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(200),
  tenantName: z.string().trim().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const createTenantSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const switchTenantSchema = z.object({
  tenantId: z.string().uuid(),
});

export const createBookingSchema = z.object({
  title: z.string().trim().min(1).max(200),
  customerName: z.string().trim().min(1).max(200),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateBookingSchema = createBookingSchema.partial();
