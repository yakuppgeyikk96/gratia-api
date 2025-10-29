import { z } from "zod";

const variantAttributesSchema = z.object({
  color: z.string().trim().optional(),
  size: z.string().trim().optional(),
  material: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  style: z.string().trim().optional(),
  pattern: z.string().trim().optional(),
});

const productVariantSchema = z.object({
  attributes: variantAttributesSchema,
  sku: z.string().min(1, "SKU is required").trim(),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
  price: z.number().min(0, "Price cannot be negative").optional(),
  discountedPrice: z
    .number()
    .min(0, "Discounted price cannot be negative")
    .optional(),
});

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name cannot exceed 200 characters")
    .trim(),

  slug: z
    .string()
    .min(1, "Product slug is required")
    .max(200, "Product slug cannot exceed 200 characters")
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"),

  description: z.string().min(1, "Product description is required").trim(),

  sku: z.string().min(1, "Product SKU is required").trim(),

  categoryId: z.string().min(1, "Category is required"),

  collectionSlugs: z
    .array(
      z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid collection slug")
    )
    .default([]),

  basePrice: z.number().min(0, "Base price cannot be negative"),

  baseDiscountedPrice: z
    .number()
    .min(0, "Discounted price cannot be negative")
    .optional(),

  images: z.array(z.string().url("Please enter a valid URL")).default([]),

  variants: z.array(productVariantSchema).default([]),

  metaTitle: z
    .string()
    .max(60, "Meta title cannot exceed 60 characters")
    .trim()
    .optional(),

  metaDescription: z
    .string()
    .max(160, "Meta description cannot exceed 160 characters")
    .trim()
    .optional(),

  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
