import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import {
  createCollectionController,
  getActiveCollectionsController,
  getAllCollectionsController,
  getCollectionByIdController,
  getCollectionBySlugController,
  getCollectionsByTypeController,
} from "../controllers/collection.controller";
import { createCollectionSchema } from "../validations/collection.validations";

const router: Router = Router();

// POST /api/collections - Create collection
router.post(
  "/",
  validateBody(createCollectionSchema),
  createCollectionController
);

// GET /api/collections - Get all collections
router.get("/", getAllCollectionsController);

// GET /api/collections/active - Get active collections only
router.get("/active", getActiveCollectionsController);

// GET /api/collections/type/:type - Get collections by type (new, trending, sale, featured)
router.get("/type/:type", getCollectionsByTypeController);

// GET /api/collections/:id - Get collection by ID
router.get("/:id", getCollectionByIdController);

// GET /api/collections/slug/:slug - Get collection by slug
router.get("/slug/:slug", getCollectionBySlugController);

export default router;
