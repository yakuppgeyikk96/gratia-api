/**
 * Checkout session configuration
 */
export const CHECKOUT_CONFIG = {
  SESSION_TTL_SECONDS: 20 * 60, // 20 minutes
  SESSION_TOKEN_PREFIX: "chk_sess_",
  SESSION_TOKEN_LENGTH: 32,
};

/**
 * Redis key prefixes
 */
export const CHECKOUT_REDIS_KEYS = {
  SESSION_PREFIX: "checkout:session:",
};

/**
 * Checkout error messages
 */
export const CHECKOUT_MESSAGES = {
  SESSION_NOT_FOUND: "Checkout session not found",
  SESSION_EXPIRED: "Checkout session has expired",
  SESSION_INVALID_TOKEN: "Invalid session token format",
  CART_EMPTY: "Cannot create checkout session with empty cart",
  CART_NOT_FOUND: "Cart not found",
  SESSION_ALREADY_COMPLETED: "Checkout session is already completed",
  INVALID_STEP: "Invalid checkout step",
  SHIPPING_ADDRESS_REQUIRED: "Shipping address is required",
  SHIPPING_METHOD_REQUIRED: "Shipping method is required",
  PAYMENT_METHOD_REQUIRED: "Payment method is required",
  BANK_TRANSFER_NOT_SUPPORTED: "Bank transfer is not supported",
  CASH_ON_DELIVERY_NOT_SUPPORTED: "Cash on delivery is not supported",
  ORDER_CREATION_FAILED: "Failed to create order",
  PAYMENT_TOKEN_REQUIRED: "Payment token is required",
};

/**
 * Checkout limits
 */
export const CHECKOUT_LIMITS = {
  MAX_ITEMS: 50,
  MIN_ITEMS: 1,
};
