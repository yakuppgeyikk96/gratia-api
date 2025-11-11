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
import { AddToCartDto, SyncCartDto, UpdateCartItemDto } from "../types";

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

export const syncCartService = async (
  userId: string,
  data: SyncCartDto
): Promise<CartDoc> => {
  const { items } = data;

  // 1. Get or create cart
  const cart = await findOrCreateCart(userId);

  // 2. Validation results tracking
  const validatedItems: Array<{
    sku: string;
    productId: string;
    quantity: number;
    product: any;
  }> = [];

  const errors: Array<{ sku: string; error: string }> = [];

  // 3. Validate all items from frontend
  for (const item of items) {
    try {
      // Validate product exists and is active
      const product = await validateProductAndStock(
        item.productId,
        item.quantity
      );

      // Verify SKU matches
      if (product.sku !== item.sku) {
        errors.push({ sku: item.sku, error: CART_MESSAGES.INVALID_SKU });
        continue;
      }

      validatedItems.push({
        sku: item.sku,
        productId: item.productId,
        quantity: item.quantity,
        product,
      });
    } catch (error: any) {
      // Track validation errors but continue processing other items
      errors.push({
        sku: item.sku,
        error: error.message || "Validation failed",
      });
    }
  }

  // 4. Create a map of frontend items by SKU
  const frontendItemsMap = new Map<string, (typeof validatedItems)[0]>();
  for (const validatedItem of validatedItems) {
    frontendItemsMap.set(validatedItem.sku, validatedItem);
  }

  // 5. Merge strategy: Frontend items take priority, but merge quantities intelligently
  const mergedItems = new Map<string, any>();

  // First, add all existing cart items
  for (const existingItem of cart.items) {
    const frontendItem = frontendItemsMap.get(existingItem.sku);

    if (frontendItem) {
      // Item exists in both frontend and backend
      // Use the maximum of frontend quantity and existing quantity (or sum, depending on business logic)
      // For sync, we'll use frontend quantity as source of truth, but respect MAX_QUANTITY
      const syncQuantity = Math.min(
        frontendItem.quantity,
        CART_LIMITS.MAX_QUANTITY_PER_ITEM
      );

      // Re-validate with sync quantity
      try {
        await validateProductAndStock(frontendItem.productId, syncQuantity);

        // Build cart item with synced quantity
        const cartItem = buildCartItem(frontendItem.product, syncQuantity);
        mergedItems.set(existingItem.sku, cartItem);
      } catch (error: any) {
        // If sync quantity fails, keep existing item
        mergedItems.set(existingItem.sku, existingItem);
        errors.push({
          sku: existingItem.sku,
          error: `Could not sync quantity: ${error.message}`,
        });
      }
    } else {
      // Item exists only in backend - keep it
      mergedItems.set(existingItem.sku, existingItem);
    }
  }

  // 6. Add new items from frontend that don't exist in backend
  for (const validatedItem of validatedItems) {
    if (!mergedItems.has(validatedItem.sku)) {
      // New item - add to cart
      const cartItem = buildCartItem(
        validatedItem.product,
        validatedItem.quantity
      );
      mergedItems.set(validatedItem.sku, cartItem);
    }
  }

  // 7. Check cart limits
  if (mergedItems.size > CART_LIMITS.MAX_ITEMS) {
    throw new AppError(
      `Cart cannot contain more than ${CART_LIMITS.MAX_ITEMS} items`,
      ErrorCode.BAD_REQUEST
    );
  }

  // 8. Update cart with merged items
  cart.items = Array.from(mergedItems.values()) as any;
  const updatedCart = await cart.save();

  // 9. Log errors if any
  if (errors.length > 0) {
    console.warn("Cart sync completed with errors:", errors);
  }

  return updatedCart;
};
