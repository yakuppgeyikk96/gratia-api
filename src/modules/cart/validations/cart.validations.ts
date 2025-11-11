import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  sku: z.string().min(1, "SKU is required").trim(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
});

export const updateCartItemSchema = z.object({
  sku: z.string().min(1, "SKU is required").trim(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be less than 0")
    .max(100, "Quantity cannot exceed 100"),
});

export const removeFromCartParamsSchema = z.object({
  sku: z.string().min(1, "SKU is required").trim(),
});

export const syncCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        sku: z.string().min(1, "SKU is required").trim(),
        quantity: z
          .number()
          .int("Quantity must be an integer")
          .min(1, "Quantity cannot be less than 1")
          .max(100, "Quantity cannot exceed 100"),
      })
    )
    .max(50, "Cannot sync more than 50 items at once"),
});

export type AddToCartDto = z.infer<typeof addToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
export type SyncCartDto = z.infer<typeof syncCartSchema>;
