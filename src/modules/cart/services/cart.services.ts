import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { ProductDoc } from "../../../shared/models";
import { CartDoc } from "../../../shared/models/cart.model";
import { findProductById } from "../../product/repositories/product.repository";
import { CART_LIMITS, CART_MESSAGES } from "../constants/cart.constants";
import { buildCartItem, validateProductAndStock } from "../helpers";
import {
  clearCart,
  findOrCreateCart,
  removeItemFromCart,
  updateCartItem,
} from "../repositories/cart.repository";
import { AddToCartDto, SyncCartDto, UpdateCartItemDto } from "../types";

export const getCartService = async (userId: string): Promise<CartDoc> => {
  const cart = await findOrCreateCart(userId);

  if (cart.items.length === 0) {
    return cart;
  }

  // Fetch all products in parallel
  const productPromises = cart.items.map((item) =>
    findProductById(item.productId.toString()).catch(() => null)
  );

  const products = await Promise.all(productPromises);

  let hasChanges = false;
  const itemsToKeep: any[] = [];

  // Update items with current product data
  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];

    if (!item) {
      continue;
    }

    const product = products[i];

    if (!product) {
      // Product not found - skip this item
      hasChanges = true;
      continue;
    }

    // Check if product is still active
    if (!product.isActive) {
      // Product inactive - skip this item
      hasChanges = true;
      continue;
    }

    // Update price and other product info if changed
    const priceChanged = item.price !== product.price;
    const discountedPriceChanged =
      item.discountedPrice !== product.discountedPrice;
    const nameChanged = item.productName !== product.name;
    const imagesChanged =
      JSON.stringify(item.productImages) !== JSON.stringify(product.images);

    if (
      priceChanged ||
      discountedPriceChanged ||
      nameChanged ||
      imagesChanged
    ) {
      item.price = product.price;
      item.discountedPrice = product.discountedPrice ?? 0;
      item.productName = product.name;
      item.productImages = product.images;
      hasChanges = true;
    }

    itemsToKeep.push(item);
  }

  // Update cart items if any were removed
  if (itemsToKeep.length !== cart.items.length) {
    cart.items = itemsToKeep as any;
    hasChanges = true;
  }

  // Save cart if any changes were made
  if (hasChanges) {
    return await cart.save();
  }

  return cart;
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
  const existingItem = cart.items.find((item) => item.sku === sku);
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

  // 7. Add to cart and save
  cart.items.push(cartItem as any);
  const updatedCart = await cart.save();

  return updatedCart;
};

export const updateCartItemService = async (
  userId: string,
  data: UpdateCartItemDto
): Promise<CartDoc> => {
  const { sku, quantity } = data;

  // 1. If quantity is 0, remove item from cart
  if (quantity === 0) {
    return await removeFromCartService(userId, sku);
  }

  // 2. Get cart to find existing item
  const cart = await findOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.sku === sku);

  if (!existingItem) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // 3. Validate product and stock availability
  const product = await validateProductAndStock(
    existingItem.productId.toString(),
    quantity
  );

  // 4. Build updated cart item with current price and product info
  const updatedCartItem = buildCartItem(product, quantity);

  // 5. Update cart item
  const updatedCart = await updateCartItem(userId, sku, updatedCartItem);
  if (!updatedCart) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return updatedCart;
};

export const removeFromCartService = async (
  userId: string,
  sku: string
): Promise<CartDoc> => {
  const updatedCart = await removeItemFromCart(userId, sku);

  if (!updatedCart) {
    throw new AppError(CART_MESSAGES.ITEM_NOT_FOUND, ErrorCode.NOT_FOUND);
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

  // 2. Validate frontend items and create map
  const validatedItemsMap = new Map<
    string,
    {
      sku: string;
      productId: string;
      quantity: number;
      product: ProductDoc;
    }
  >();

  const errors: Array<{ sku: string; error: string }> = [];

  // 3. Validate all items from frontend
  for (const item of items) {
    try {
      const product = await validateProductAndStock(
        item.productId,
        item.quantity
      );

      if (product.sku !== item.sku) {
        errors.push({ sku: item.sku, error: CART_MESSAGES.INVALID_SKU });
        continue;
      }

      // Apply MAX_QUANTITY limit
      const syncQuantity = Math.min(
        item.quantity,
        CART_LIMITS.MAX_QUANTITY_PER_ITEM
      );

      // Re-check stock only (product already validated)
      if (product.stock < syncQuantity) {
        errors.push({
          sku: item.sku,
          error: CART_MESSAGES.INSUFFICIENT_STOCK,
        });
        continue;
      }

      validatedItemsMap.set(item.sku, {
        sku: item.sku,
        productId: item.productId,
        quantity: syncQuantity,
        product,
      });
    } catch (error: any) {
      errors.push({
        sku: item.sku,
        error: error.message || "Validation failed",
      });
    }
  }

  // 4. Merge: Frontend items take priority, keep existing items not in frontend
  const mergedItems = new Map<string, any>();

  // Add validated frontend items (source of truth)
  for (const [sku, validatedItem] of validatedItemsMap) {
    const cartItem = buildCartItem(
      validatedItem.product,
      validatedItem.quantity
    );
    mergedItems.set(sku, cartItem);
  }

  // Add existing cart items that are not in frontend
  for (const existingItem of cart.items) {
    if (!mergedItems.has(existingItem.sku)) {
      mergedItems.set(existingItem.sku, existingItem);
    }
  }

  // 5. Check cart limits
  if (mergedItems.size > CART_LIMITS.MAX_ITEMS) {
    throw new AppError(
      `Cart cannot contain more than ${CART_LIMITS.MAX_ITEMS} items`,
      ErrorCode.BAD_REQUEST
    );
  }

  // 6. Update cart with merged items
  cart.items = Array.from(mergedItems.values()) as any;
  const updatedCart = await cart.save();

  // 7. Log errors if any
  if (errors.length > 0) {
    console.warn("Cart sync completed with errors:", errors);
  }

  return updatedCart;
};
