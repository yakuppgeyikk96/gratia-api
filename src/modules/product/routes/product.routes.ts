import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import {
  createProductController,
  getProductByIdController,
  getProductsController,
} from "../controllers/product.controller";
import { createProductSchema } from "../validations/product.validations";

const router: Router = Router();

// POST /api/products - Create product
router.post("/", validateBody(createProductSchema), createProductController);

// GET /api/products - Get products
router.get("/", getProductsController);

// GET /api/products/:id - Get product by ID
router.get("/:id", getProductByIdController);

export default router;
