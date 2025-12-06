import { z } from "zod";

// Country code schema (2 characters, uppercase)
export const countryCodeParamsSchema = z.object({
  code: z
    .string()
    .min(1, "Country code is required")
    .length(2, "Country code must be 2 characters")
    .regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters")
    .transform((val) => val.toUpperCase()),
});

// Country ID schema (MongoDB ObjectId)
export const countryIdParamsSchema = z.object({
  countryId: z
    .string()
    .min(1, "Country ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid country ID format"),
});

// State ID schema (MongoDB ObjectId)
export const stateIdParamsSchema = z.object({
  stateId: z
    .string()
    .min(1, "State ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid state ID format"),
});
