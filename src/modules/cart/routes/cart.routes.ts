import { Router } from "express";
import {
  validateBody,
  validateParams,
} from "../../../shared/middlewares/validation.middleware";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCartController,
  updateCartItemController,
} from "../controllers/cart.controller";
import {
  addToCartSchema,
  removeFromCartParamsSchema,
  updateCartItemSchema,
} from "../validations/cart.validations";

const router: Router = Router();

// GET /api/cart - Get user's cart
router.get("/", getCartController);

// POST /api/cart - Add item to cart
router.post("/", validateBody(addToCartSchema), addToCartController);

// PUT /api/cart - Update cart item quantity
router.put("/", validateBody(updateCartItemSchema), updateCartItemController);

// DELETE /api/cart/:sku - Remove item from cart
router.delete(
  "/:sku",
  validateParams(removeFromCartParamsSchema),
  removeFromCartController
);

// DELETE /api/cart - Clear cart
router.delete("/", clearCartController);

export default router;
