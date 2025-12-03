import { Response } from "express";
import { asyncHandler } from "../../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import {
  completeCheckoutService,
  createCheckoutSessionService,
  getCheckoutSessionService,
  selectShippingMethodService,
  updateShippingAddressService,
} from "../services/checkout-session.service";
import {
  CompletePaymentDto,
  CreateCheckoutSessionDto,
  SelectShippingMethodDto,
  UpdateShippingAddressDto,
} from "../types";

/**
 * Create a new checkout session
 * Public endpoint - works for both authenticated and guest users
 */
export const createCheckoutSessionController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const payload: CreateCheckoutSessionDto = req.body;

    // For authenticated users, get cart from database
    // For guest users, use items from request body
    const result = await createCheckoutSessionService(payload.items);

    returnSuccess(
      res,
      result,
      "Checkout session created successfully",
      StatusCode.CREATED
    );
  }
);

/**
 * Get checkout session by token
 * Public endpoint - works for both authenticated and guest users
 */
export const getCheckoutSessionController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    const session = await getCheckoutSessionService(token!);

    returnSuccess(
      res,
      session,
      "Checkout session retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Update shipping address
 * Public endpoint - works for both authenticated and guest users
 */
export const updateShippingAddressController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    const payload: UpdateShippingAddressDto = req.body;

    const session = await updateShippingAddressService(
      token!,
      payload.shippingAddress,
      payload.billingAddress,
      payload.billingIsSameAsShipping
    );

    returnSuccess(
      res,
      session,
      "Shipping address updated successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Select shipping method
 * Public endpoint - works for both authenticated and guest users
 */
export const selectShippingMethodController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;

    const payload: SelectShippingMethodDto = req.body;

    // TODO: Get shipping method details (price, etc.) from shipping service
    // For now, we'll need to pass shipping cost in the request
    const shippingCost = payload.shippingCost || 0;

    const session = await selectShippingMethodService(
      token!,
      payload.shippingMethodId,
      shippingCost
    );

    returnSuccess(
      res,
      session,
      "Shipping method selected successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Complete checkout and create order
 * Public endpoint - works for both authenticated and guest users
 */
export const completeCheckoutController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.params;
    const payload: CompletePaymentDto = req.body;

    // TODO: Process payment and create order
    // For now, we'll use a placeholder order ID
    const orderId = "order_placeholder_" + Date.now();

    const session = await completeCheckoutService(
      token!,
      payload.paymentMethodType,
      orderId
    );

    returnSuccess(
      res,
      {
        orderId: session.orderId,
        orderNumber: orderId, // TODO: Generate proper order number
        session,
      },
      "Checkout completed successfully",
      StatusCode.SUCCESS
    );
  }
);
