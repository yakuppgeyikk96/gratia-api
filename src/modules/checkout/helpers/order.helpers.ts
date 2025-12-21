import crypto from "crypto";
import { ObjectId } from "mongoose";
import {
  OrderDoc,
  OrderStatus,
  PaymentStatus,
} from "../../../shared/models/order.model";
import { OrderNumber } from "../types";
import { CheckoutSession } from "../types/checkout-session.types";

/**
 * Generates unique order number
 * Format: ORD-TIMESTAMP-RANDOM
 * Uses timestamp (milliseconds) + crypto random for guaranteed uniqueness
 * @returns Order number with type safety
 */
export const generateOrderNumber = (): OrderNumber => {
  const timestamp = Date.now(); // Milliseconds since epoch
  const randomBytes = crypto.randomBytes(6); // 12 hex characters
  const randomHex = randomBytes.toString("hex").toUpperCase();

  // Format: ORD-TIMESTAMP-RANDOM
  return `ORD-${timestamp}-${randomHex}` as OrderNumber;
};

/**
 * Maps checkout session to order data
 * @param session - Checkout session (assumed to be validated)
 * @param orderNumber - Generated order number
 * @param userId - User ID (optional, found by email)
 * @param paymentIntentId - Stripe payment intent ID (optional)
 * @returns Order data ready to be saved
 */
export const mapCheckoutSessionToOrder = (
  session: CheckoutSession,
  orderNumber: OrderNumber,
  userId: ObjectId | undefined,
  paymentIntentId?: string
): Partial<OrderDoc> => {
  return {
    orderNumber,
    ...(userId && { userId }),
    email: session.shippingAddress!.email!,
    items: session.cartSnapshot.items,
    shippingAddress: session.shippingAddress!,
    billingAddress: session.billingAddress!,
    shippingMethodId: session.shippingMethodId!,
    paymentMethodType: session.paymentMethodType!,
    ...(paymentIntentId && { paymentIntentId }),
    pricing: session.pricing,
    status: OrderStatus.PENDING,
    paymentStatus: paymentIntentId ? PaymentStatus.PAID : PaymentStatus.PENDING,
  };
};
