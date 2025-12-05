import { z } from "zod";

// Address Schema
export const addressSchema = z.object({
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
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email")
    .toLowerCase()
    .trim()
    .optional(),
  addressLine1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(200, "Address line 1 cannot exceed 200 characters")
    .trim(),
  addressLine2: z
    .string()
    .max(200, "Address line 2 cannot exceed 200 characters")
    .trim()
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City cannot exceed 100 characters")
    .trim(),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State cannot exceed 100 characters")
    .trim(),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code cannot exceed 20 characters")
    .trim(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country cannot exceed 100 characters")
    .trim(),
});

// Create Checkout Session Schema
export const createCheckoutSessionSchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required").trim(),
        quantity: z
          .number()
          .int("Quantity must be an integer")
          .min(1, "Quantity must be at least 1")
          .max(100, "Quantity cannot exceed 100"),
      })
    )
    .min(1, "At least one item is required")
    .max(50, "Cannot checkout more than 50 items at once"),
});

// Update Shipping Address Schema
export const updateShippingAddressSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  billingIsSameAsShipping: z.boolean().default(false),
});

// Select Shipping Method Schema
export const selectShippingMethodSchema = z.object({
  shippingMethodId: z.string().min(1, "Shipping method ID is required").trim(),
});

// Complete Payment Schema
export const completePaymentSchema = z.object({
  paymentMethodType: z.enum(
    ["credit_card", "bank_transfer", "cash_on_delivery"],
    {
      message:
        "Payment method must be credit_card, bank_transfer, or cash_on_delivery",
    }
  ),
  paymentToken: z.string().trim().optional(),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .trim()
    .optional(),
});

// Token Params Schema
export const tokenParamsSchema = z.object({
  token: z
    .string()
    .min(1, "Session token is required")
    .regex(/^chk_sess_[a-f0-9]{64}$/i, "Invalid session token format"),
});
