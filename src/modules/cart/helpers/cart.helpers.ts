import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CartItem } from "../../../shared/models/cart.model";
import { ProductDoc } from "../../../shared/models/product.model";
import { findProductById } from "../../product/repositories/product.repository";
import { CART_MESSAGES } from "../constants/cart.constants";

/**
 * Validates product existence, activity status, and stock availability
 * @param productId - Product ID to validate
 * @param quantity - Required quantity
 * @returns Validated product
 */
export const validateProductAndStock = async (
  productId: string,
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

  // 3. Validate stock availability
  if (product.stock < quantity) {
    throw new AppError(CART_MESSAGES.INSUFFICIENT_STOCK, ErrorCode.BAD_REQUEST);
  }

  return product;
};

/**
 * Creates a cart item object from product
 * @param product - Product document
 * @param quantity - Item quantity
 * @returns Cart item object
 */
export const buildCartItem = (
  product: ProductDoc,
  quantity: number
): Omit<CartItem, "productId"> & { productId: any } => {
  // Check if this product is part of a group (has variants)
  const isVariant =
    !!product.productGroupId &&
    product.productGroupId !== `pg_${product._id.toString()}`;

  return {
    productId: product._id,
    sku: product.sku,
    quantity,
    price: product.price,
    ...(product.discountedPrice !== undefined && {
      discountedPrice: product.discountedPrice,
    }),
    productName: product.name,
    productImages: product.images,
    attributes: product.attributes,
    isVariant,
  };
};
