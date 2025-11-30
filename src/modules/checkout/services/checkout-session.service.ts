import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import {
  deleteRedisValue,
  getRedisValue,
  setRedisValue,
} from "../../../shared/services";
import { buildCartItem } from "../../cart/helpers/cart.helpers";
import { findOrCreateCart } from "../../cart/repositories/cart.repository";
import { findProductBySku } from "../../product/repositories/product.repository";
import {
  CHECKOUT_CONFIG,
  CHECKOUT_MESSAGES,
} from "../constants/checkout.constants";
import {
  calculateExpiresAt,
  calculateInitialPricing,
  createCartSnapshot,
  generateSessionToken,
  getSessionRedisKey,
  isSessionExpired,
} from "../helpers";
import {
  CheckoutSession,
  CheckoutStatus,
  CheckoutStep,
  CreateCheckoutSessionResponse,
} from "../types";

/**
 * Creates a new checkout session from user's cart
 * @param userId - User ID (for authenticated users)
 * @param guestEmail - Guest email (for guest users)
 * @param items - Cart items (for guest users, required if no userId)
 * @returns Session token and expiration
 */
export const createCheckoutSessionService = async (
  userId?: string,
  guestEmail?: string,
  items?: { sku: string; quantity: number }[]
): Promise<CreateCheckoutSessionResponse> => {
  // For guest users, items are required
  if (!userId && !items) {
    throw new AppError(
      "Items are required for guest checkout",
      ErrorCode.BAD_REQUEST
    );
  }

  // Get user's cart (only for authenticated users)
  let cart = null;
  if (userId) {
    cart = await findOrCreateCart(userId);

    // Validate cart has items
    if (cart.items.length === 0) {
      throw new AppError(CHECKOUT_MESSAGES.CART_EMPTY, ErrorCode.BAD_REQUEST);
    }
  }

  // Generate session token
  const sessionToken = generateSessionToken();
  const expiresAt = calculateExpiresAt();

  // Create cart snapshot
  let cartSnapshot;
  if (cart) {
    // Authenticated user: use cart from database
    cartSnapshot = createCartSnapshot(cart);
  } else if (items && items.length > 0) {
    // Guest user: validate items and create snapshot from frontend items
    const validatedItems = [];

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

    cartSnapshot = {
      items: validatedItems,
      subtotal,
      totalItems,
    };
  } else {
    throw new AppError(CHECKOUT_MESSAGES.CART_EMPTY, ErrorCode.BAD_REQUEST);
  }

  // Calculate initial pricing
  const pricing = calculateInitialPricing(cartSnapshot);

  // Create checkout session
  const session: CheckoutSession = {
    sessionToken,
    userId: userId ? (userId as any) : null,
    guestEmail: guestEmail || null,
    cartId: cart?._id || null,
    currentStep: CheckoutStep.SHIPPING,
    status: CheckoutStatus.ACTIVE,
    shippingAddress: null,
    billingAddress: null,
    shippingMethodId: null,
    paymentMethodType: null,
    cartSnapshot,
    pricing,
    expiresAt,
    completedAt: null,
    orderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save to Redis with TTL
  const redisKey = getSessionRedisKey(sessionToken);
  await setRedisValue(redisKey, session, CHECKOUT_CONFIG.SESSION_TTL_SECONDS);

  return {
    sessionToken,
    expiresAt,
  };
};

/**
 * Gets checkout session by token
 * @param sessionToken - Session token
 * @returns Checkout session
 */
export const getCheckoutSessionService = async (
  sessionToken: string
): Promise<CheckoutSession> => {
  const redisKey = getSessionRedisKey(sessionToken);
  const session: CheckoutSession | null = await getRedisValue<CheckoutSession>(
    redisKey
  );

  // Validate session
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

  return session;
};

/**
 * Updates checkout session
 * @param sessionToken - Session token
 * @param updates - Partial session updates
 * @returns Updated session
 */
export const updateCheckoutSessionService = async (
  sessionToken: string,
  updates: Partial<CheckoutSession>
): Promise<CheckoutSession> => {
  // Get existing session
  const session = await getCheckoutSessionService(sessionToken);

  // Merge updates
  const updatedSession: CheckoutSession = {
    ...session,
    ...updates,
    updatedAt: new Date(),
    // Prevent overwriting critical fields
    sessionToken: session.sessionToken,
    createdAt: session.createdAt,
  };

  // Save updated session to Redis
  const redisKey = getSessionRedisKey(sessionToken);
  await setRedisValue(
    redisKey,
    updatedSession,
    CHECKOUT_CONFIG.SESSION_TTL_SECONDS
  );

  return updatedSession;
};

/**
 * Deletes checkout session
 * @param sessionToken - Session token
 */
export const deleteCheckoutSessionService = async (
  sessionToken: string
): Promise<void> => {
  const redisKey = getSessionRedisKey(sessionToken);
  await deleteRedisValue(redisKey);
};

/**
 * Updates shipping address in checkout session
 * @param sessionToken - Session token
 * @param shippingAddress - Shipping address
 * @param billingAddress - Billing address (optional)
 * @param billingIsSameAsShipping - Whether billing address is same as shipping
 * @returns Updated session
 */
export const updateShippingAddressService = async (
  sessionToken: string,
  shippingAddress: any,
  billingAddress?: any,
  billingIsSameAsShipping: boolean = false
): Promise<CheckoutSession> => {
  const session = await getCheckoutSessionService(sessionToken);

  // For guest users, update email from shipping address if not already set
  let guestEmail = session.guestEmail;
  if (!session.userId && shippingAddress.email && !guestEmail) {
    guestEmail = shippingAddress.email;
  }

  const updates: Partial<CheckoutSession> = {
    shippingAddress,
    billingAddress: billingIsSameAsShipping ? shippingAddress : billingAddress,
    guestEmail: guestEmail || session.guestEmail, // Update email if provided
    currentStep: CheckoutStep.SHIPPING_METHOD,
  };

  return await updateCheckoutSessionService(sessionToken, updates);
};

/**
 * Selects shipping method and updates pricing
 * @param sessionToken - Session token
 * @param shippingMethodId - Shipping method ID
 * @param shippingCost - Shipping cost
 * @returns Updated session
 */
export const selectShippingMethodService = async (
  sessionToken: string,
  shippingMethodId: string,
  shippingCost: number
): Promise<CheckoutSession> => {
  const session = await getCheckoutSessionService(sessionToken);

  // Validate shipping address exists
  if (!session.shippingAddress) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  // Update pricing with shipping cost
  const updatedPricing = {
    ...session.pricing,
    shippingCost,
    total: session.pricing.subtotal + shippingCost - session.pricing.discount,
  };

  const updates: Partial<CheckoutSession> = {
    shippingMethodId: shippingMethodId as any,
    pricing: updatedPricing,
    currentStep: CheckoutStep.PAYMENT,
  };

  return await updateCheckoutSessionService(sessionToken, updates);
};

/**
 * Completes checkout and marks session as completed
 * @param sessionToken - Session token
 * @param paymentMethodType - Payment method type
 * @param orderId - Created order ID
 * @returns Completed session
 */
export const completeCheckoutService = async (
  sessionToken: string,
  paymentMethodType: any,
  orderId: string
): Promise<CheckoutSession> => {
  const session = await getCheckoutSessionService(sessionToken);

  // Validate all required fields
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

  const updates: Partial<CheckoutSession> = {
    paymentMethodType,
    orderId: orderId as any,
    status: CheckoutStatus.COMPLETED,
    currentStep: CheckoutStep.COMPLETED,
    completedAt: new Date(),
  };

  return await updateCheckoutSessionService(sessionToken, updates);
};
