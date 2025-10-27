import Category, { CategoryDoc } from "../../../shared/models/category.model";
import Product, { ProductDoc } from "../../../shared/models/product.model";
import { CreateProductDto } from "../types";

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
  return await Product.findById(id)
    .populate("categoryId", "name slug description")
    .populate("collectionIds", "name slug collectionType");
};

export const findProductBySlugWithDetails = async (
  slug: string
): Promise<ProductDoc | null> => {
  return await Product.findOne({ slug: slug.toLowerCase() })
    .populate("categoryId", "name slug description")
    .populate("collectionIds", "name slug collectionType");
};

export const findAllProducts = async (): Promise<ProductDoc[]> => {
  return await Product.find().sort({ createdAt: -1 });
};

export const findAllProductsWithDetails = async (): Promise<ProductDoc[]> => {
  return await Product.find()
    .populate("categoryId", "name slug description")
    .populate("collectionIds", "name slug collectionType")
    .sort({ createdAt: -1 });
};

export const findProductsByCategory = async (
  categoryId: string
): Promise<ProductDoc[]> => {
  return await Product.find({ categoryId });
};

export const findProductsByCategoryPath = async (
  categorySlug: string
): Promise<ProductDoc[]> => {
  return await Product.find({
    $or: [
      { categoryPath: categorySlug },
      { categoryPath: new RegExp(`^${categorySlug}#`) },
    ],
    isActive: true,
  }).sort({ createdAt: -1 });
};

export const findProductsByCollection = async (
  collectionId: string
): Promise<ProductDoc[]> => {
  return await Product.find({ collectionIds: collectionId });
};

export const findActiveProducts = async (): Promise<ProductDoc[]> => {
  return await Product.find({ isActive: true }).sort({ createdAt: -1 });
};

export const findActiveProductsWithDetails = async (): Promise<
  ProductDoc[]
> => {
  return await Product.find({ isActive: true })
    .populate("categoryId", "name slug description")
    .populate("collectionIds", "name slug collectionType")
    .sort({ createdAt: -1 });
};

export const findProductBySku = async (
  sku: string
): Promise<ProductDoc | null> => {
  return await Product.findOne({ sku });
};

export const findProductByVariantSku = async (
  variantSku: string
): Promise<ProductDoc | null> => {
  return await Product.findOne({ "variants.sku": variantSku });
};
