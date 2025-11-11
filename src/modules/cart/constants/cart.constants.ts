export const CART_MESSAGES = {
  // Success messages
  CART_RETRIEVED: "Cart retrieved successfully",
  ITEM_ADDED: "Item added to cart successfully",
  ITEM_UPDATED: "Cart item updated successfully",
  ITEM_REMOVED: "Item removed from cart successfully",
  CART_CLEARED: "Cart cleared successfully",
  CART_SYNCED: "Cart synchronized successfully",

  // Error messages
  CART_NOT_FOUND: "Cart not found",
  ITEM_NOT_FOUND: "Item not found in cart",
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_NOT_ACTIVE: "Product is not active",
  INSUFFICIENT_STOCK: "Insufficient stock available",
  INVALID_SKU: "Invalid SKU for this product",
  ITEM_ALREADY_IN_CART: "Item already exists in cart",
  CART_UPDATE_FAILED: "Failed to update cart",
  VARIANT_NOT_FOUND: "Product variant not found",
  MAX_QUANTITY_EXCEEDED: "Maximum quantity per item exceeded",
  MAX_ITEMS_EXCEEDED: "Cannot sync more than 50 items at once",
  SYNC_FAILED: "Failed to synchronize cart",
};

export const CART_LIMITS = {
  MAX_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 100,
};
