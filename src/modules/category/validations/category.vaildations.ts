import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters")
    .trim(),

  slug: z
    .string()
    .min(1, "Category slug is required")
    .max(100, "Category slug cannot exceed 100 characters")
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),

  parentId: z.string().optional(),

  level: z
    .number()
    .int("Level must be an integer")
    .min(0, "Level must be 0 or greater")
    .default(0),

  imageUrl: z.string().url("Please enter a valid URL").trim().optional(),

  isActive: z.boolean().default(true),

  sortOrder: z.number().int("Sort order must be an integer").default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
