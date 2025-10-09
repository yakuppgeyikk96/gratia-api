import { z } from "zod";

export const registerUserSchema = z.object({
  token: z.string().min(1, "Token is required"),
  code: z.string().min(1, "Code is required"),
});
