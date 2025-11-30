import Cart, { CartDoc, CartItem } from "../../../shared/models/cart.model";

export const findCartByUserId = async (
  userId: string
): Promise<CartDoc | null> => {
  return await Cart.findOne({ userId });
};

export const createCart = async (userId: string): Promise<CartDoc> => {
  const cart = new Cart({ userId, items: [] });
  return await cart.save();
};

export const findOrCreateCart = async (userId: string): Promise<CartDoc> => {
  let cart = await findCartByUserId(userId);
  if (!cart) {
    cart = await createCart(userId);
  }
  return cart;
};

export const addItemToCart = async (
  userId: string,
  item: CartItem
): Promise<CartDoc | null> => {
  // Find or create cart
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Add item
  cart.items.push(item as any);

  // Save (triggers pre-save hook for totals calculation)
  return await cart.save();
};

export const updateCartItem = async (
  userId: string,
  sku: string,
  item: CartItem
): Promise<CartDoc | null> => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return null;
  }

  // Find and update item
  const itemIndex = cart.items.findIndex((item) => item.sku === sku);
  if (itemIndex === -1) {
    return null;
  }

  // Replace entire item to update price and other fields
  cart.items[itemIndex] = item as any;

  // Save (triggers pre-save hook for totals calculation)
  return await cart.save();
};

export const removeItemFromCart = async (
  userId: string,
  sku: string
): Promise<CartDoc | null> => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return null;
  }

  // Check if item exists
  const itemExists = cart.items.some((item) => item.sku === sku);
  if (!itemExists) {
    return null; // Item not found
  }

  // Remove item
  cart.items = cart.items.filter((item) => item.sku !== sku) as any;

  // Save (triggers pre-save hook for totals calculation)
  return await cart.save();
};

export const clearCart = async (userId: string): Promise<CartDoc | null> => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return null;
  }

  // Clear items
  cart.items = [];

  // Save (triggers pre-save hook for totals calculation)
  return await cart.save();
};

export const getCartItemBySku = async (
  userId: string,
  sku: string
): Promise<CartItem | null> => {
  const cart = await Cart.findOne(
    { userId, "items.sku": sku },
    { "items.$": 1 }
  );
  return cart && cart.items.length > 0 ? (cart.items[0] as CartItem) : null;
};
