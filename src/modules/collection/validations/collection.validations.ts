import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Collection name cannot exceed 100 characters")
    .trim(),

  slug: z
    .string()
    .min(1, "Collection slug is required")
    .max(100, "Collection slug cannot exceed 100 characters")
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),

  collectionType: z
    .enum(["new", "trending", "sale", "featured"])
    .refine((val) => ["new", "trending", "sale", "featured"].includes(val), {
      message:
        "Collection type must be 'new', 'trending', 'sale' or 'featured'",
    }),

  isActive: z.boolean().default(true),

  sortOrder: z.number().int("Sort order must be an integer").default(0),

  imageUrl: z
    .string()
    .regex(/^https?:\/\/.+$/, "Please enter a valid URL")
    .trim()
    .optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();
