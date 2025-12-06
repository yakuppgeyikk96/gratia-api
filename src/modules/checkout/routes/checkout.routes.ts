import { Router } from "express";
import { validateBody, validateParams } from "../../../shared/middlewares";
import {
  countryCodeParamsSchema,
  stateCodeParamsSchema,
} from "../../location/validations/location.validations";
import {
  completeCheckoutController,
  createCheckoutSessionController,
  getCheckoutSessionController,
  getShippingCitiesOptionsController,
  getShippingCountryOptionsController,
  getShippingMethodsController,
  getShippingStatesOptionsController,
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

// GET /api/checkout/session/:token/shipping-methods - Get available shipping methods
router.get(
  "/session/:token/shipping-methods",
  validateParams(tokenParamsSchema),
  getShippingMethodsController
);

// GET /api/checkout/shipping-country-options - Get available shipping country options
router.get("/shipping-country-options", getShippingCountryOptionsController);

// GET /api/checkout/shipping-states-options - Get available shipping states options
router.get(
  "/shipping-states-options/:code",
  validateParams(countryCodeParamsSchema),
  getShippingStatesOptionsController
);

// GET /api/checkout/shipping-cities-options - Get available shipping cities options
router.get(
  "/shipping-cities-options/:countryCode/:stateCode",
  validateParams(stateCodeParamsSchema),
  getShippingCitiesOptionsController
);

export default router;
