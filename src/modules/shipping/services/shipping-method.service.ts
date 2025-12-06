import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { ShippingMethodDoc } from "../../../shared/models/shipping-method.model";
import { Address } from "../../../shared/types";
import { CartSnapshot } from "../../checkout/types/checkout-session.types";
import { SHIPPING_MESSAGES } from "../constants/shipping.constants";
import {
  findAvailableShippingMethodsByCountry,
  findShippingMethodByIdAndValidate,
} from "../repositories/shipping-method.repository";

/**
 * Gets available shipping methods for checkout session
 * Filters by country and applies free shipping rules based on cart total
 * @param shippingAddress - Shipping address
 * @param cartSnapshot - Cart snapshot with subtotal
 * @returns Array of available shipping methods with calculated prices
 */
export const getAvailableShippingMethodsService = async (
  shippingAddress: Address,
  cartSnapshot: CartSnapshot
): Promise<ShippingMethodDoc[]> => {
  // Get shipping methods available for the country
  const methods = await findAvailableShippingMethodsByCountry(
    shippingAddress.country
  );

  // Apply free shipping rules based on cart total
  const availableMethods = methods.map((method) => {
    // If method has minOrderAmount and cart total meets requirement, make it free
    if (
      method.minOrderAmount &&
      cartSnapshot.subtotal >= method.minOrderAmount
    ) {
      return {
        ...method.toObject(),
        price: 0,
        isFree: true,
      } as ShippingMethodDoc;
    }

    return method;
  });

  return availableMethods;
};

/**
 * Validates shipping method and returns it
 * @param shippingMethodId - Shipping method ID
 * @returns Validated shipping method
 */
export const validateShippingMethodService = async (
  shippingMethodId: string
): Promise<ShippingMethodDoc> => {
  const method = await findShippingMethodByIdAndValidate(shippingMethodId);

  if (!method) {
    throw new AppError(
      SHIPPING_MESSAGES.SHIPPING_METHOD_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return method;
};

/**
 * Calculates shipping cost for a method based on cart total
 * Applies free shipping if cart total meets minOrderAmount
 * @param method - Shipping method
 * @param cartSubtotal - Cart subtotal
 * @returns Calculated shipping cost
 */
export const calculateShippingCost = (
  method: ShippingMethodDoc,
  cartSubtotal: number
): number => {
  // Check if free shipping applies
  if (method.minOrderAmount && cartSubtotal >= method.minOrderAmount) {
    return 0;
  }

  return method.price;
};
