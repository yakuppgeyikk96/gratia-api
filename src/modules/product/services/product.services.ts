import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { ProductDoc } from "../../../shared/models/product.model";
import { findCategoryById } from "../../category/repositories/category.repository";
import { findCollectionById } from "../../collection/repositories/collection.repository";
import { PRODUCT_MESSAGES } from "../constants/product.constants";
import {
  createProduct,
  findActiveProducts,
  findActiveProductsWithDetails,
  findAllProducts,
  findAllProductsWithDetails,
  findProductById,
  findProductByIdWithDetails,
  findProductBySku,
  findProductBySlug,
  findProductBySlugWithDetails,
  findProductsByCategory,
  findProductsByCategoryPath,
  findProductsByCollection,
} from "../repositories/product.repository";
import CreateProductDto from "../types/CreateProductDto";

export const createProductService = async (
  data: CreateProductDto
): Promise<ProductDoc> => {
  /**
   * Check if the product slug already exists
   * If it does, throw an error
   */
  const existingProduct = await findProductBySlug(data.slug);
  if (existingProduct) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  /**
   * Check if the product SKU already exists
   * If it does, throw an error
   */
  const existingSku = await findProductBySku(data.sku);
  if (existingSku) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_SKU_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  /**
   * Check if the category exists
   * If it doesn't, throw an error
   */
  const category = await findCategoryById(data.categoryId);
  if (!category) {
    throw new AppError(
      PRODUCT_MESSAGES.CATEGORY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  /**
   * Check if the collections exist
   * If they don't, throw an error
   */
  if (data.collectionIds && data.collectionIds.length > 0) {
    for (const collectionId of data.collectionIds) {
      const collection = await findCollectionById(collectionId);
      if (!collection) {
        throw new AppError(
          PRODUCT_MESSAGES.COLLECTION_NOT_FOUND,
          ErrorCode.NOT_FOUND
        );
      }
    }
  }

  /**
   * Create the product
   * If it doesn't, throw an error
   */
  const product = await createProduct(data);
  if (!product) {
    throw new AppError(
      PRODUCT_MESSAGES.PRODUCT_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return product;
};

export const getAllProductsService = async (
  withDetails = false
): Promise<ProductDoc[]> => {
  /**
   * If withDetails is true, return all products with details
   * Otherwise, return all products
   */
  if (withDetails) {
    return await findAllProductsWithDetails();
  }
  return await findAllProducts();
};

export const getActiveProductsService = async (
  withDetails = false
): Promise<ProductDoc[]> => {
  /**
   * If withDetails is true, return all active products with details
   * Otherwise, return all active products
   */
  if (withDetails) {
    return await findActiveProductsWithDetails();
  }
  return await findActiveProducts();
};

export const getProductByIdService = async (
  id: string,
  withDetails = false
): Promise<ProductDoc> => {
  /**
   * If withDetails is true, return the product with details
   * Otherwise, return the product
   */
  const product = withDetails
    ? await findProductByIdWithDetails(id)
    : await findProductById(id);

  if (!product) {
    throw new AppError(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return product;
};

export const getProductBySlugService = async (
  slug: string,
  withDetails = false
): Promise<ProductDoc> => {
  /**
   * If withDetails is true, return the product with details
   * Otherwise, return the product
   */
  const product = withDetails
    ? await findProductBySlugWithDetails(slug)
    : await findProductBySlug(slug);

  if (!product) {
    throw new AppError(PRODUCT_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return product;
};

export const getProductsByCategoryService = async (
  categoryId: string
): Promise<ProductDoc[]> => {
  /**
   * Return all products by category
   */
  return await findProductsByCategory(categoryId);
};

export const getProductsByCollectionService = async (
  collectionId: string
): Promise<ProductDoc[]> => {
  /**
   * Return all products by collection
   */
  return await findProductsByCollection(collectionId);
};

export const getProductsByCategoryPathService = async (
  categorySlug: string
): Promise<ProductDoc[]> => {
  return await findProductsByCategoryPath(categorySlug);
};
