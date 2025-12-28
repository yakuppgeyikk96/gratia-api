import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { OrderDoc } from "../../../shared/models/order.model";
import {
  confirmPaymentIntent,
  createPaymentIntent,
  deleteRedisValue,
  setRedisValue,
} from "../../../shared/services";
import {
  calculateShippingCost,
  validateShippingMethodService,
} from "../../shipping/services";
import {
  CHECKOUT_CONFIG,
  CHECKOUT_MESSAGES,
} from "../constants/checkout.constants";
import {
  calculateExpiresAt,
  calculateInitialPricing,
  generateSessionToken,
  getSessionRedisKey,
  getSessionWithTTL,
  updatePricingWithShipping,
  validateAndBuildGuestCartSnapshot,
  validateCheckoutCompletion,
} from "../helpers";
import { generateOrderNumber } from "../helpers/order.helpers";
import {
  CheckoutSession,
  CheckoutStatus,
  CheckoutStep,
  CreateCheckoutSessionResponse,
  PaymentMethodType,
} from "../types";
import { createOrderFromSession } from "./order.service";

/**
 * Creates a new checkout session from selected items
 * @param items - Selected cart items (required)
 * @returns Session token and expiration
 */
export const createCheckoutSessionService = async (
  items: { sku: string; quantity: number }[]
): Promise<CreateCheckoutSessionResponse> => {
  // Validate items
  if (!items || items.length === 0) {
    throw new AppError(CHECKOUT_MESSAGES.CART_EMPTY, ErrorCode.BAD_REQUEST);
  }

  // Generate session token
  const sessionToken = generateSessionToken();
  const expiresAt = calculateExpiresAt();

  // Create cart snapshot from items
  const cartSnapshot = await validateAndBuildGuestCartSnapshot(items);

  // Calculate initial pricing
  const pricing = calculateInitialPricing(cartSnapshot);

  // Create checkout session
  const session: CheckoutSession = {
    sessionToken,
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
    orderNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ttl: CHECKOUT_CONFIG.SESSION_TTL_SECONDS,
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
 * @returns Checkout session with TTL
 */
export const getCheckoutSessionService = async (
  sessionToken: string
): Promise<CheckoutSession> => {
  return await getSessionWithTTL(sessionToken);
};

/**
 * Updates checkout session
 * @param sessionToken - Session token
 * @param updates - Partial session updates
 * @returns Updated session with fresh TTL
 */
export const updateCheckoutSessionService = async (
  sessionToken: string,
  updates: Partial<CheckoutSession>
): Promise<CheckoutSession> => {
  // Get existing session
  const session = await getSessionWithTTL(sessionToken);

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

  // Return with fresh TTL
  return await getSessionWithTTL(sessionToken);
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
  const updates: Partial<CheckoutSession> = {
    shippingAddress,
    billingAddress: billingIsSameAsShipping ? shippingAddress : billingAddress,
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
  shippingMethodId: string
): Promise<CheckoutSession> => {
  const session = await getSessionWithTTL(sessionToken);

  // Validate shipping address exists
  if (!session.shippingAddress) {
    throw new AppError(
      CHECKOUT_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
      ErrorCode.BAD_REQUEST
    );
  }

  // Validate and get shipping method
  const method = await validateShippingMethodService(shippingMethodId);

  // Calculate shipping cost (applies free shipping rules)
  const shippingCost = calculateShippingCost(
    method,
    session.cartSnapshot.subtotal
  );

  // Update pricing with shipping cost
  const updatedPricing = updatePricingWithShipping(
    session.pricing,
    shippingCost
  );

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
  paymentMethodType: PaymentMethodType,
  paymentToken: string
): Promise<OrderDoc> => {
  /* Generate order number to be used for the order follow-up */
  const orderNumber = generateOrderNumber();

  /* Get the session from the database */
  const session = await getCheckoutSessionService(sessionToken);

  /* Validate if session is valid */
  validateCheckoutCompletion(session);

  let paymentIntentId: string | undefined;

  if (paymentMethodType === PaymentMethodType.CREDIT_CARD) {
    if (!paymentToken) {
      throw new AppError(
        CHECKOUT_MESSAGES.PAYMENT_TOKEN_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const paymentIntent = await createPaymentIntent(
      session.pricing.total,
      "usd",
      {
        sessionToken: session.sessionToken,
      }
    );

    const confirmedPaymentIntent = await confirmPaymentIntent(
      paymentIntent.id,
      paymentToken
    );

    paymentIntentId = confirmedPaymentIntent.id;
  } else if (paymentMethodType === PaymentMethodType.BANK_TRANSFER) {
    throw new AppError(
      CHECKOUT_MESSAGES.BANK_TRANSFER_NOT_SUPPORTED,
      ErrorCode.BAD_REQUEST
    );
  } else if (paymentMethodType === PaymentMethodType.CASH_ON_DELIVERY) {
    throw new AppError(
      CHECKOUT_MESSAGES.CASH_ON_DELIVERY_NOT_SUPPORTED,
      ErrorCode.BAD_REQUEST
    );
  }

  const completedSession: CheckoutSession = {
    ...session,
    paymentMethodType,
    orderNumber,
    status: CheckoutStatus.COMPLETED,
    currentStep: CheckoutStep.COMPLETED,
    completedAt: new Date(),
  };

  /**
   * Create order from session
   */
  const order = await createOrderFromSession(completedSession, paymentIntentId);

  if (!order) {
    throw new AppError(
      CHECKOUT_MESSAGES.ORDER_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  /* Remove session from Redis after order is created */
  await deleteCheckoutSessionService(sessionToken);

  return order;
};
