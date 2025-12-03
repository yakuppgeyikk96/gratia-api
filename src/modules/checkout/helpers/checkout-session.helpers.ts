import crypto from "crypto";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CartDoc, CartItem } from "../../../shared/models/cart.model";
import { getRedisKeyTTL, getRedisValue } from "../../../shared/services";
import { buildCartItem } from "../../cart/helpers/cart.helpers";
import { findProductBySku } from "../../product/repositories/product.repository";
import {
  CHECKOUT_CONFIG,
  CHECKOUT_MESSAGES,
  CHECKOUT_REDIS_KEYS,
} from "../constants/checkout.constants";
import {
  CartSnapshot,
  CheckoutPricing,
  CheckoutSession,
  CheckoutStatus,
  CheckoutStep,
} from "../types";

/**
 * Generates a unique session token
 * @returns Session token with format: chk_sess_<random_string>
 */
export const generateSessionToken = (): string => {
  const randomBytes = crypto.randomBytes(CHECKOUT_CONFIG.SESSION_TOKEN_LENGTH);
  const randomString = randomBytes.toString("hex");
  return `${CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX}${randomString}`;
};

/**
 * Generates Redis key for session storage
 * @param sessionToken - Session token
 * @returns Redis key
 */
export const getSessionRedisKey = (sessionToken: string): string => {
  return `${CHECKOUT_REDIS_KEYS.SESSION_PREFIX}${sessionToken}`;
};

/**
 * Validates session token format
 * @param sessionToken - Token to validate
 * @returns True if valid format
 */
export const validateSessionTokenFormat = (sessionToken: string): boolean => {
  if (!sessionToken || typeof sessionToken !== "string") {
    return false;
  }

  // Check prefix
  if (!sessionToken.startsWith(CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX)) {
    return false;
  }

  // Check length (prefix + hex string)
  const expectedLength =
    CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX.length +
    CHECKOUT_CONFIG.SESSION_TOKEN_LENGTH * 2; // hex is 2 chars per byte

  if (sessionToken.length !== expectedLength) {
    return false;
  }

  // Check if remainder is valid hex
  const hexPart = sessionToken.substring(
    CHECKOUT_CONFIG.SESSION_TOKEN_PREFIX.length
  );
  const hexRegex = /^[a-f0-9]+$/i;

  return hexRegex.test(hexPart);
};

/**
 * Calculates expiration date (current time + TTL)
 * @returns Expiration date
 */
export const calculateExpiresAt = (): Date => {
  const expiresAt = new Date();
  expiresAt.setSeconds(
    expiresAt.getSeconds() + CHECKOUT_CONFIG.SESSION_TTL_SECONDS
  );
  return expiresAt;
};

/**
 * Checks if session has expired
 * @param session - Checkout session
 * @returns True if expired
 */
export const isSessionExpired = (session: CheckoutSession): boolean => {
  return new Date() > session.expiresAt;
};

/**
 * Creates cart snapshot from cart
 * @param cart - Cart document
 * @returns Cart snapshot
 */
export const createCartSnapshot = (cart: CartDoc): CartSnapshot => {
  return {
    items: cart.items.map((item) => ({
      productId: item.productId,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      discountedPrice: item.discountedPrice ?? 0,
      productName: item.productName,
      productImages: item.productImages,
      attributes: item.attributes,
      isVariant: item.isVariant,
    })),
    subtotal: cart.totalPrice,
    totalItems: cart.totalItems,
  };
};

/**
 * Calculates initial pricing from cart snapshot
 * @param cartSnapshot - Cart snapshot
 * @returns Initial pricing
 */
export const calculateInitialPricing = (
  cartSnapshot: CartSnapshot
): CheckoutPricing => {
  return {
    subtotal: cartSnapshot.subtotal,
    shippingCost: 0,
    discount: 0,
    tax: 0,
    total: cartSnapshot.subtotal,
  };
};

/**
 * Validates session and throws error if invalid
 * @param session - Checkout session or null
 * @param sessionToken - Session token for error message
 */
export const validateSession = (
  session: CheckoutSession | null
): asserts session is CheckoutSession => {
  if (!session) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  if (isSessionExpired(session)) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_EXPIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  if (session.status === CheckoutStatus.COMPLETED) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_ALREADY_COMPLETED,
      ErrorCode.BAD_REQUEST
    );
  }
};

/**
 * Checks if session can proceed to next step
 * @param session - Checkout session
 * @param requiredStep - Required step to check
 * @returns True if can proceed
 */
export const canProceedToStep = (
  session: CheckoutSession,
  requiredStep: CheckoutStep
): boolean => {
  const stepOrder = [
    CheckoutStep.SHIPPING,
    CheckoutStep.SHIPPING_METHOD,
    CheckoutStep.PAYMENT,
    CheckoutStep.COMPLETED,
  ];

  const currentStepIndex = stepOrder.indexOf(session.currentStep);
  const requiredStepIndex = stepOrder.indexOf(requiredStep);

  return currentStepIndex >= requiredStepIndex;
};

/**
 * Validates guest items and creates cart snapshot
 * @param items - Guest cart items
 * @returns Cart snapshot
 */
export const validateAndBuildGuestCartSnapshot = async (
  items: { sku: string; quantity: number }[]
): Promise<CartSnapshot> => {
  const validatedItems: CartItem[] = [];

  // Validate all items
  for (const item of items) {
    // Find product by SKU
    const product = await findProductBySku(item.sku);

    if (!product) {
      throw new AppError(
        `Product with SKU ${item.sku} not found`,
        ErrorCode.NOT_FOUND
      );
    }

    // Check if product is active
    if (!product.isActive) {
      throw new AppError(
        `Product with SKU ${item.sku} is not active`,
        ErrorCode.BAD_REQUEST
      );
    }

    // Validate stock availability
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for product with SKU ${item.sku}`,
        ErrorCode.BAD_REQUEST
      );
    }

    // Build cart item
    const cartItem = buildCartItem(product, item.quantity);
    validatedItems.push(cartItem);
  }

  // Calculate subtotal
  const subtotal = validatedItems.reduce((sum, item) => {
    const itemPrice = item.discountedPrice ?? item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const totalItems = validatedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    items: validatedItems,
    subtotal,
    totalItems,
  };
};

/**
 * Gets session with TTL from Redis and validates it
 * @param sessionToken - Session token
 * @returns Session with updated TTL
 */
export const getSessionWithTTL = async (
  sessionToken: string
): Promise<CheckoutSession> => {
  const redisKey = getSessionRedisKey(sessionToken);
  const session: CheckoutSession | null = await getRedisValue<CheckoutSession>(
    redisKey
  );

  // Validate session manually
  if (!session) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  if (isSessionExpired(session)) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_EXPIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  if (session.status === CheckoutStatus.COMPLETED) {
    throw new AppError(
      CHECKOUT_MESSAGES.SESSION_ALREADY_COMPLETED,
      ErrorCode.BAD_REQUEST
    );
  }

  // Get TTL from Redis and update session
  const ttl = await getRedisKeyTTL(redisKey);

  return {
    ...session,
    ttl: ttl > 0 ? ttl : 0,
  };
};

/**
 * Updates pricing with shipping cost
 * @param currentPricing - Current pricing
 * @param shippingCost - Shipping cost
 * @returns Updated pricing
 */
export const updatePricingWithShipping = (
  currentPricing: CheckoutPricing,
  shippingCost: number
): CheckoutPricing => {
  return {
    ...currentPricing,
    shippingCost,
    total: currentPricing.subtotal + shippingCost - currentPricing.discount,
  };
};

/**
 * Validates checkout completion requirements
 * @param session - Checkout session
 */
export const validateCheckoutCompletion = (session: CheckoutSession): void => {
  if (!session.shippingAddress) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  if (!session.shippingMethodId) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_METHOD_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }
};
