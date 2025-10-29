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
    query.categoryPath = new RegExp(`^${categorySlug.replace(/#/g, "#")}`);
  }

  if (collectionSlug) {
    query.collectionSlugs = collectionSlug;
  }

  /**
   * Variant Filters
   */
  if (
    filters &&
    (filters.colors || filters.sizes || filters.brands || filters.materials)
  ) {
    query.$or = [];

    if (
      filters.colors ||
      filters.sizes ||
      filters.brands ||
      filters.materials
    ) {
      query["variants"] = {
        $elemMatch: {
          ...(filters.colors && {
            "attributes.color": { $in: filters.colors },
          }),
          ...(filters.sizes && { "attributes.size": { $in: filters.sizes } }),
          ...(filters.brands && {
            "attributes.brand": { $in: filters.brands },
          }),
          ...(filters.materials && {
            "attributes.material": { $in: filters.materials },
          }),
        },
      };
    }
  }

  /**
   * Price Filters
   */
  if (filters && (filters.minPrice || filters.maxPrice)) {
    query.basePrice = {};
    if (filters.minPrice) query.basePrice.$gte = filters.minPrice;
    if (filters.maxPrice) query.basePrice.$lte = filters.maxPrice;
  }

  // Sorting
  let sortQuery: any = {};
  switch (sort) {
    case "newest":
      sortQuery = { createdAt: -1 };
      break;
    case "price-low":
      sortQuery = { basePrice: 1 };
      break;
    case "price-high":
      sortQuery = { basePrice: -1 };
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
    query.categoryPath = new RegExp(`^${categorySlug.replace(/#/g, "#")}`);
  }

  if (collectionSlug) {
    query.collectionSlugs = collectionSlug;
  }

  const products = await Product.find(query);

  const colors = new Set<string>();
  const sizes = new Set<string>();
  const brands = new Set<string>();
  const materials = new Set<string>();
  const prices: number[] = [];

  products.forEach((product) => {
    prices.push(product.basePrice);
    if (product.baseDiscountedPrice) {
      prices.push(product.baseDiscountedPrice);
    }

    product.variants.forEach((variant) => {
      if (variant.attributes.color) colors.add(variant.attributes.color);
      if (variant.attributes.size) sizes.add(variant.attributes.size);
      if (variant.attributes.brand) brands.add(variant.attributes.brand);
      if (variant.attributes.material)
        materials.add(variant.attributes.material);
    });
  });

  return {
    colors: Array.from(colors).sort(),
    sizes: Array.from(sizes).sort(),
    brands: Array.from(brands).sort(),
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
