import { z } from "zod";

// Standardized attribute enums
const productColorEnum = z.enum([
  "black",
  "white",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "beige",
  "navy",
  "teal",
  "burgundy",
  "olive",
  "cream",
  "tan",
  "maroon",
  "coral",
  "silver",
  "gold",
  "khaki",
  "mint",
  "lavender",
]);

const productSizeEnum = z.enum([
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "one-size",
]);

const productMaterialEnum = z.enum([
  "cotton",
  "polyester",
  "wool",
  "silk",
  "linen",
  "denim",
  "leather",
  "suede",
  "cashmere",
  "nylon",
  "spandex",
  "rayon",
  "velvet",
  "satin",
  "acrylic",
  "modal",
  "viscose",
]);

const productAttributesSchema = z.object({
  color: productColorEnum.optional(),
  size: productSizeEnum.optional(),
  material: productMaterialEnum.optional(),
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

  description: z.string().trim().optional(),

  sku: z.string().min(1, "Product SKU is required").trim(),

  categoryId: z.string().min(1, "Category is required"),

  collectionSlugs: z
    .array(
      z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid collection slug")
    )
    .default([]),

  price: z.number().min(0, "Price cannot be negative"),

  discountedPrice: z
    .number()
    .min(0, "Discounted price cannot be negative")
    .optional(),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),

  attributes: productAttributesSchema.optional(),

  images: z.array(z.string().url("Please enter a valid URL")).default([]),

  productGroupId: z.string().trim().optional(),

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
