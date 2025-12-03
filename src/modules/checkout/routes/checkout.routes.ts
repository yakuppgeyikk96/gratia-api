import { Router } from "express";
import { validateBody, validateParams } from "../../../shared/middlewares";
import {
  completeCheckoutController,
  createCheckoutSessionController,
  getCheckoutSessionController,
  selectShippingMethodController,
  updateShippingAddressController,
} from "../controllers/checkout.controller";
import {
  completePaymentSchema,
  createCheckoutSessionSchema,
  selectShippingMethodSchema,
  tokenParamsSchema,
  updateShippingAddressSchema,
} from "../validations/checkout.validations";

const router: Router = Router();

// POST /api/checkout/session - Create checkout session
router.post(
  "/session",
  validateBody(createCheckoutSessionSchema),
  createCheckoutSessionController
);

// GET /api/checkout/session/:token - Get checkout session
router.get(
  "/session/:token",
  validateParams(tokenParamsSchema),
  getCheckoutSessionController
);

// PUT /api/checkout/session/:token/shipping - Update shipping address
router.put(
  "/session/:token/shipping",
  validateParams(tokenParamsSchema),
  validateBody(updateShippingAddressSchema),
  updateShippingAddressController
);

// PUT /api/checkout/session/:token/shipping-method - Select shipping method
router.put(
  "/session/:token/shipping-method",
  validateParams(tokenParamsSchema),
  validateBody(selectShippingMethodSchema),
  selectShippingMethodController
);

// POST /api/checkout/session/:token/complete - Complete checkout
router.post(
  "/session/:token/complete",
  validateParams(tokenParamsSchema),
  validateBody(completePaymentSchema),
  completeCheckoutController
);

export default router;
