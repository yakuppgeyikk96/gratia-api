import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CartDoc } from "../../../shared/models/cart.model";
import { CART_LIMITS, CART_MESSAGES } from "../constants/cart.constants";
import { buildCartItem, validateProductAndStock } from "../helpers";
import {
  addItemToCart,
  clearCart,
  findOrCreateCart,
  getCartItemBySku,
  removeItemFromCart,
  updateCartItem,
} from "../repositories/cart.repository";
import { AddToCartDto, UpdateCartItemDto } from "../types";

export const getCartService = async (userId: string): Promise<CartDoc> => {
  return await findOrCreateCart(userId);
};

export const addToCartService = async (
  userId: string,
  data: AddToCartDto
): Promise<CartDoc> => {
  const { productId, sku, quantity } = data;

  // 1. Get or create cart
  const cart = await findOrCreateCart(userId);

  // 2. Check cart limits
  if (cart.items.length >= CART_LIMITS.MAX_ITEMS) {
    throw new AppError(
      `Cart cannot contain more than ${CART_LIMITS.MAX_ITEMS} items`,
      ErrorCode.BAD_REQUEST
    );
  }

  // 3. Handle existing item (increment quantity)
  const existingItem = await getCartItemBySku(userId, sku);
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
      throw new AppError(
        CART_MESSAGES.MAX_QUANTITY_EXCEEDED,
        ErrorCode.BAD_REQUEST
      );
    }
    return await updateCartItemService(userId, { sku, quantity: newQuantity });
  }

  // 4. Validate product and stock
  const product = await validateProductAndStock(productId, quantity);

  // 5. Verify SKU matches
  if (product.sku !== sku) {
    throw new AppError(CART_MESSAGES.INVALID_SKU, ErrorCode.BAD_REQUEST);
  }

  // 6. Build cart item
  const cartItem = buildCartItem(product, quantity);

  // 7. Add to cart
  const updatedCart = await addItemToCart(userId, cartItem);
  if (!updatedCart) {
    throw new AppError(
      CART_MESSAGES.CART_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return updatedCart;
};

export const updateCartItemService = async (
  userId: string,
  data: UpdateCartItemDto
): Promise<CartDoc> => {
  const { sku, quantity } = data;

  // 1. Check if item exists in cart
  const existingItem = await getCartItemBySku(userId, sku);
  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // 2. Validate product and stock availability
  await validateProductAndStock(existingItem.productId.toString(), quantity);

  // 3. Update cart item
  const updatedCart = await updateCartItem(userId, sku, quantity);
  if (!updatedCart) {
    throw new AppError(
      CART_MESSAGES.CART_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return updatedCart;
};

export const removeFromCartService = async (
  userId: string,
  sku: string
): Promise<CartDoc> => {
  // 1. Check if item exists in cart
  const existingItem = await getCartItemBySku(userId, sku);
  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // 2. Remove item from cart
  const updatedCart = await removeItemFromCart(userId, sku);
  if (!updatedCart) {
    throw new AppError(
      CART_MESSAGES.CART_UPDATE_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return updatedCart;
};

export const clearCartService = async (userId: string): Promise<CartDoc> => {
  const cart = await clearCart(userId);
  if (!cart) {
    throw new AppError(CART_MESSAGES.CART_NOT_FOUND, ErrorCode.NOT_FOUND);
  }
  return cart;
};
