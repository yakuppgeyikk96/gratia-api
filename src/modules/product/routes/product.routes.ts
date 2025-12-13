import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import {
  createProductController,
  getFeaturedProductsController,
  getProductByIdController,
  getProductsController,
  getProductWithVariantsController,
} from "../controllers/product.controller";
import { createProductSchema } from "../validations/product.validations";

const router: Router = Router();

// POST /api/products - Create product
router.post("/", validateBody(createProductSchema), createProductController);

// GET /api/products/featured - Get featured products
router.get("/featured", getFeaturedProductsController);

// GET /api/products - Get products
router.get("/", getProductsController);

// GET /api/products/:slug/with-variants - Get product with variants
router.get("/:slug/with-variants", getProductWithVariantsController);

// GET /api/products/:id - Get product by ID
router.get("/:id", getProductByIdController);

export default router;
