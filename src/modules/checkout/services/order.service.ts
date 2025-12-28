import Order, { OrderDoc } from "../../../shared/models/order.model";
import { findUserIdByEmail } from "../../user/repositories/user.repository";
import {
  generateOrderNumber,
  mapCheckoutSessionToOrder,
} from "../helpers/order.helpers";
import { CheckoutSession } from "../types";

/**
 * Creates order from checkout session
 * Assumes session is already validated (validation should be done in controller/middleware)
 * @param session - Checkout session (validated)
 * @param paymentIntentId - Stripe payment intent ID (optional)
 * @returns Created order
 */
export const createOrderFromSession = async (
  session: CheckoutSession,
  paymentIntentId?: string
): Promise<OrderDoc> => {
  const userId = await findUserIdByEmail(session.shippingAddress!.email!);

  const orderNumber = generateOrderNumber();

  const orderData = mapCheckoutSessionToOrder(
    session,
    orderNumber,
    userId,
    paymentIntentId
  );

  const order = new Order(orderData);
  return await order.save();
};
