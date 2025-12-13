import { FilterQuery } from "mongoose";
import Category, { CategoryDoc } from "../../../shared/models/category.model";
import Product, { ProductDoc } from "../../../shared/models/product.model";
import { CreateProductDto } from "../types";
import ProductQueryOptionsDto from "../types/ProductQueryOptionsDto";

export const buildCategoryPath = async (
  categoryId: string
): Promise<string> => {
  const slugs: string[] = [];
  let currentCategoryId: string | null = categoryId;

  while (currentCategoryId) {
    const category: CategoryDoc | null = await Category.findById(
      currentCategoryId
    );
    if (!category) break;

    slugs.unshift(category.slug);

    if (category.parentId) {
      currentCategoryId = category.parentId.toString();
    } else {
      currentCategoryId = null;
    }
  }

  return slugs.join("#");
};

export const createProduct = async (
  productData: CreateProductDto
): Promise<ProductDoc> => {
  const categoryPath = await buildCategoryPath(productData.categoryId);

  const product = new Product({
    ...productData,
    categoryPath,
  });

  return await product.save();
};

export const findProducts = async (
  options: ProductQueryOptionsDto,
  withDetails: boolean = false
): Promise<{ products: ProductDoc[]; total: number }> => {
  const {
    categorySlug,
    collectionSlug,
    filters,
    sort = "newest",
    page = 1,
    limit = 10,
  } = options;

  const query: FilterQuery<ProductDoc> = {
    isActive: true,
  };

  if (categorySlug) {
    const escapedSlug = categorySlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.categoryPath = new RegExp(`(^|#)${escapedSlug}(#|$)`);
  }

  if (collectionSlug) {
    query.collectionSlugs = collectionSlug;
  }

  /**
   * Attribute Filters
   */
  if (filters) {
    if (filters.colors && filters.colors.length > 0) {
      query["attributes.color"] = { $in: filters.colors };
    }
    if (filters.sizes && filters.sizes.length > 0) {
      query["attributes.size"] = { $in: filters.sizes };
    }
    if (filters.materials && filters.materials.length > 0) {
      query["attributes.material"] = { $in: filters.materials };
    }
  }

  /**
   * Price Filters
   */
  if (filters && (filters.minPrice || filters.maxPrice)) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }

  // Sorting
  let sortQuery: any = {};
  switch (sort) {
    case "newest":
      sortQuery = { createdAt: -1 };
      break;
    case "price-low":
      sortQuery = { price: 1 };
      break;
    case "price-high":
      sortQuery = { price: -1 };
      break;
    case "name":
      sortQuery = { name: 1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  /**
   * Pagination
   */
  const skip = (page - 1) * limit;

  let queryBuilder = Product.find(query);

  if (withDetails) {
    queryBuilder = queryBuilder.populate("categoryId", "name slug description");
  }

  const [products, total] = await Promise.all([
    queryBuilder.sort(sortQuery).skip(skip).limit(limit).exec(),
    Product.countDocuments(query),
  ]);

  return { products, total };
};

export const extractFilterOptions = async (
  categorySlug?: string,
  collectionSlug?: string
): Promise<any> => {
  const query: any = { isActive: true };

  if (categorySlug) {
    const escapedSlug = categorySlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.categoryPath = new RegExp(`(^|#)${escapedSlug}(#|$)`);
  }

  if (collectionSlug) {
    query.collectionSlugs = collectionSlug;
  }

  const products = await Product.find(query);

  const colors = new Set<string>();
  const sizes = new Set<string>();
  const materials = new Set<string>();
  const prices: number[] = [];

  products.forEach((product) => {
    // Add price
    prices.push(product.price);
    if (product.discountedPrice) {
      prices.push(product.discountedPrice);
    }

    // Add attributes
    if (product.attributes.color) colors.add(product.attributes.color);
    if (product.attributes.size) sizes.add(product.attributes.size);
    if (product.attributes.material) materials.add(product.attributes.material);
  });

  return {
    colors: Array.from(colors).sort(),
    sizes: Array.from(sizes).sort(),
    materials: Array.from(materials).sort(),
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
  };
};

export const findProductBySlug = async (
  slug: string
): Promise<ProductDoc | null> => {
  return await Product.findOne({ slug: slug.toLowerCase() });
};

export const findProductById = async (
  id: string
): Promise<ProductDoc | null> => {
  return await Product.findById(id);
};

export const findProductByIdWithDetails = async (
  id: string
): Promise<ProductDoc | null> => {
  return await Product.findById(id).populate(
    "categoryId",
    "name slug description"
  );
};

export const findProductBySku = async (
  sku: string
): Promise<ProductDoc | null> => {
  return await Product.findOne({ sku });
};

export const findProductsByGroupId = async (
  productGroupId: string
): Promise<ProductDoc[]> => {
  return await Product.find({
    productGroupId,
    isActive: true,
  }).sort({ "attributes.color": 1, "attributes.size": 1 });
};

export const findFeaturedProducts = async (
  limit: number = 10
): Promise<ProductDoc[]> => {
  return await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ featuredOrder: 1, createdAt: -1 })
    .limit(limit)
    .exec();
};
