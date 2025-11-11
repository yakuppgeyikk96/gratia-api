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
  syncCartController,
  updateCartItemController,
} from "../controllers/cart.controller";
import {
  addToCartSchema,
  removeFromCartParamsSchema,
  syncCartSchema,
  updateCartItemSchema,
} from "../validations/cart.validations";

const router: Router = Router();

// GET /api/cart - Get user's cart
router.get("/", getCartController);

// POST /api/cart - Add item to cart
router.post("/", validateBody(addToCartSchema), addToCartController);

router.post("/sync", validateBody(syncCartSchema), syncCartController);

// PUT /api/cart - Update cart item quantity
router.put("/", validateBody(updateCartItemSchema), updateCartItemController);

// DELETE /api/cart - Clear cart
router.delete("/", clearCartController);

// DELETE /api/cart/:sku - Remove item from cart
router.delete(
  "/:sku",
  validateParams(removeFromCartParamsSchema),
  removeFromCartController
);

export default router;
