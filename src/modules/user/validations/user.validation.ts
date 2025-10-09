import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .email("Please enter a valid email")
    .min(1, "Email is required")
    .toLowerCase()
    .trim(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});
