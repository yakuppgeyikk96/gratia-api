import Category, { CategoryDoc } from "../../../shared/models/category.model";
import { CreateCategoryDto } from "../types";

export const createCategory = async (
  categoryData: CreateCategoryDto
): Promise<CategoryDoc> => {
  const category = new Category(categoryData);
  return await category.save();
};

export const findCategoryBySlug = async (
  slug: string
): Promise<CategoryDoc | null> => {
  return await Category.findOne({ slug: slug.toLowerCase() });
};

export const findCategoryById = async (
  id: string
): Promise<CategoryDoc | null> => {
  return await Category.findById(id);
};

export const findAllCategories = async (): Promise<CategoryDoc[]> => {
  return await Category.find().sort({ sortOrder: 1, name: 1 });
};

export const findCategoriesByParentId = async (
  parentId: string
): Promise<CategoryDoc[]> => {
  return await Category.find({ parentId }).sort({ sortOrder: 1, name: 1 });
};

export const findActiveCategories = async (): Promise<CategoryDoc[]> => {
  return await Category.find({ isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const findActiveRootCategories = async (): Promise<CategoryDoc[]> => {
  return await Category.find({ isActive: true, level: 0 }).sort({
    sortOrder: 1,
    name: 1,
  });
};
