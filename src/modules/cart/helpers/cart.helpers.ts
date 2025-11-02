import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CartItem } from "../../../shared/models/cart.model";
import {
  ProductDoc,
  ProductVariantAttributes,
} from "../../../shared/models/product.model";
import { findProductById } from "../../product/repositories/product.repository";
import { CART_MESSAGES } from "../constants/cart.constants";

/**
 * Validates product existence, activity status, and stock availability
 * @param productId - Product ID to validate
 * @param sku - SKU to check (base product or variant)
 * @param quantity - Required quantity
 * @returns Validated product
 */
export const validateProductAndStock = async (
  productId: string,
  sku: string,
  quantity: number
): Promise<ProductDoc> => {
  // 1. Check if product exists
  const product = await findProductById(productId);
  if (!product) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // 2. Check if product is active
  if (!product.isActive) {
    throw new AppError(CART_MESSAGES.PRODUCT_NOT_ACTIVE, ErrorCode.BAD_REQUEST);
  }

  // 3. Validate stock for base product or variant
  if (sku === product.sku) {
    // Base product stock check
    if (product.baseStock < quantity) {
      throw new AppError(
        CART_MESSAGES.INSUFFICIENT_STOCK,
        ErrorCode.BAD_REQUEST
      );
    }
  } else {
    // Variant stock check
    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) {
      throw new AppError(CART_MESSAGES.INVALID_SKU, ErrorCode.BAD_REQUEST);
    }
    if (variant.stock < quantity) {
      throw new AppError(
        CART_MESSAGES.INSUFFICIENT_STOCK,
        ErrorCode.BAD_REQUEST
      );
    }
  }

  return product;
};

/**
 * Gets product details (price, images, attributes) for cart item
 * @param product - Product document
 * @param sku - SKU to get details for
 * @param attributes - Optional custom attributes
 * @returns Product details for cart item
 */
export const getProductDetails = (
  product: ProductDoc,
  sku: string,
  attributes?: ProductVariantAttributes
): {
  price: number;
  discountedPrice?: number;
  images: string[];
  productAttributes: ProductVariantAttributes;
  isVariant: boolean;
} => {
  // Base product
  if (sku === product.sku) {
    const baseDiscounted = product.baseDiscountedPrice;
    return {
      price: product.basePrice,
      ...(baseDiscounted !== undefined && { discountedPrice: baseDiscounted }),
      images: product.images,
      productAttributes: attributes || product.baseAttributes,
      isVariant: false,
    };
  }

  // Variant
  const variant = product.variants.find((v) => v.sku === sku);
  if (!variant) {
    throw new AppError(CART_MESSAGES.INVALID_SKU, ErrorCode.BAD_REQUEST);
  }

  const variantDiscounted =
    variant.discountedPrice || product.baseDiscountedPrice;
  return {
    price: variant.price || product.basePrice,
    ...(variantDiscounted !== undefined && {
      discountedPrice: variantDiscounted,
    }),
    images:
      variant.images && variant.images.length > 0
        ? variant.images
        : product.images,
    productAttributes: attributes || variant.attributes,
    isVariant: true,
  };
};

/**
 * Creates a cart item object from product details
 * @param product - Product document
 * @param sku - Product SKU
 * @param quantity - Item quantity
 * @param details - Product details (price, images, etc.)
 * @returns Cart item object
 */
export const buildCartItem = (
  product: ProductDoc,
  sku: string,
  quantity: number,
  details: {
    price: number;
    discountedPrice?: number;
    images: string[];
    productAttributes: ProductVariantAttributes;
    isVariant: boolean;
  }
): Omit<CartItem, "productId"> & { productId: any } => {
  return {
    productId: product._id,
    sku,
    quantity,
    price: details.price,
    ...(details.discountedPrice !== undefined && {
      discountedPrice: details.discountedPrice,
    }),
    productName: product.name,
    productImages: details.images,
    attributes: details.productAttributes,
    isVariant: details.isVariant,
  };
};
