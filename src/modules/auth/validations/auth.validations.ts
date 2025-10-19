import { z } from "zod";

export const registerUserSchema = z.object({
  token: z.string().min(1, "Token is required"),
  code: z.string().min(1, "Code is required"),
});

export const loginUserSchema = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
