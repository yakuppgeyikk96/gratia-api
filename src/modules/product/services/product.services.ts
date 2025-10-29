import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { ProductDoc } from "../../../shared/models/product.model";
import { findCategoryById } from "../../category/repositories/category.repository";
import { findCollectionBySlug } from "../../collection/repositories/collection.repository";
import { PRODUCT_MESSAGES } from "../constants/product.constants";
import {
  createProduct,
  extractFilterOptions,
  findProductById,
  findProductByIdWithDetails,
  findProductBySku,
  findProductBySlug,
  findProducts,
} from "../repositories";
import CreateProductDto from "../types/CreateProductDto";
import ProductQueryOptionsDto from "../types/ProductQueryOptionsDto";
import ProductsResponseDto from "../types/ProductsResponseDto";

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
  if (data.collectionSlugs && data.collectionSlugs.length > 0) {
    for (const collectionSlug of data.collectionSlugs) {
      const collection = await findCollectionBySlug(collectionSlug);
      if (!collection) {
        throw new AppError(
          `Collection with slug '${collectionSlug}' not found`,
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

export const getProductsService = async (
  options: ProductQueryOptionsDto,
  withDetails = false
): Promise<ProductsResponseDto> => {
  if (!options.categorySlug && !options.collectionSlug) {
    throw new AppError(
      PRODUCT_MESSAGES.CATEGORY_OR_COLLECTION_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  const { products, total } = await findProducts(options, withDetails);

  const filterOptions = await extractFilterOptions(
    options.categorySlug,
    options.collectionSlug
  );

  const page = options.page || 1;
  const limit = options.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    products,
    filters: filterOptions,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
    sortOptions: ["newest", "price-low", "price-high", "name"],
  };
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
