import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import {
  createProductController,
  getActiveProductsController,
  getAllProductsController,
  getProductByIdController,
  getProductBySlugController,
  getProductsByCategoryController,
  getProductsByCategoryPathController,
  getProductsByCollectionController,
} from "../controllers/product.controller";
import { createProductSchema } from "../validations/product.validations";

const router: Router = Router();

// POST /api/products - Create product
router.post("/", validateBody(createProductSchema), createProductController);

// GET /api/products - Get all products
router.get("/", getAllProductsController);

// GET /api/products/active - Get active products
router.get("/active", getActiveProductsController);

// GET /api/products/category/:categoryId - Get products by category
router.get("/category/:categoryId", getProductsByCategoryController);

// GET /api/products/collection/:collectionId - Get products by collection
router.get("/collection/:collectionId", getProductsByCollectionController);

// GET /api/products/:id - Get product by ID
router.get("/:id", getProductByIdController);

// GET /api/products/slug/:slug - Get product by slug
router.get("/slug/:slug", getProductBySlugController);

// GET /api/products/category-path/:categorySlug - Get products by category path
router.get("/category-path/:categorySlug", getProductsByCategoryPathController);

export default router;
