import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CategoryDoc } from "../../../shared/models/category.model";
import { CATEGORY_MESSAGES } from "../constants/category.constants";
import { findCategoryBySlug } from "../repositories";
import {
  createCategory,
  findActiveCategories,
  findActiveRootCategories,
  findAllCategories,
  findCategoriesByParentId,
  findCategoryById,
} from "../repositories/category.repository";
import { CategoryTreeNode, CreateCategoryDto } from "../types";

export const createCategoryService = async (
  data: CreateCategoryDto
): Promise<CategoryDoc> => {
  const existingCategory = await findCategoryBySlug(data.slug);

  if (existingCategory) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  if (data.parentId) {
    const parentCategory = await findCategoryById(data.parentId);

    if (!parentCategory) {
      throw new AppError(
        CATEGORY_MESSAGES.PARENT_CATEGORY_NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }
  }

  const category = await createCategory(data);

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return category;
};

export const getAllCategoriesService = async (): Promise<CategoryDoc[]> => {
  return await findAllCategories();
};

export const getActiveCategoriesService = async (): Promise<CategoryDoc[]> => {
  return await findActiveCategories();
};

export const getActiveRootCategoriesService = async (): Promise<
  CategoryDoc[]
> => {
  return await findActiveRootCategories();
};

export const getCategoryByIdService = async (
  id: string
): Promise<CategoryDoc> => {
  const category = await findCategoryById(id);

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return category;
};

export const getCategoryBySlugService = async (
  slug: string
): Promise<CategoryDoc> => {
  const category = await findCategoryBySlug(slug);

  if (!category) {
    throw new AppError(
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }
  return category;
};
export const getSubCategoriesService = async (
  parentId: string
): Promise<CategoryDoc[]> => {
  return await findCategoriesByParentId(parentId);
};

export const getCategoryTreeService = async (): Promise<CategoryTreeNode[]> => {
  const categories = await findAllCategories();

  const buildTree = (parentId: string | null = null): CategoryTreeNode[] => {
    return categories
      .filter((cat) => {
        if (parentId === null) {
          return cat.parentId === null || cat.parentId === undefined;
        }
        return cat.parentId?.toString() === parentId;
      })
      .map((cat) => ({
        ...cat.toObject(),
        children: buildTree(cat._id.toString()),
      }));
  };

  return buildTree();
};
