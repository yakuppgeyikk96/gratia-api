import { Router } from "express";
import {
  completeCheckoutController,
  createCheckoutSessionController,
  getCheckoutSessionController,
  selectShippingMethodController,
  updateShippingAddressController,
} from "../controllers/checkout.controller";

const router: Router = Router();

// POST /api/checkout/session - Create checkout session
router.post("/session", createCheckoutSessionController);

// GET /api/checkout/session/:token - Get checkout session
router.get("/session/:token", getCheckoutSessionController);

// PUT /api/checkout/session/:token/shipping - Update shipping address
router.put("/session/:token/shipping", updateShippingAddressController);

// PUT /api/checkout/session/:token/shipping-method - Select shipping method
router.put("/session/:token/shipping-method", selectShippingMethodController);

// POST /api/checkout/session/:token/complete - Complete checkout
router.post("/session/:token/complete", completeCheckoutController);

export default router;
