import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import {
  createCategoryController,
  getActiveCategoriesController,
  getAllCategoriesController,
  getCategoryByIdController,
  getCategoryBySlugController,
  getCategoryTreeController,
  getSubCategoriesController,
} from "../controllers/category.controller";
import { createCategorySchema } from "../validations/category.vaildations";

const router: Router = Router();

router.post("/", validateBody(createCategorySchema), createCategoryController);

router.get("/", getAllCategoriesController);

router.get("/tree", getCategoryTreeController);

router.get("/active", getActiveCategoriesController);

router.get("/:id", getCategoryByIdController);

router.get("/slug/:slug", getCategoryBySlugController);

router.get("/parent/:parentId", getSubCategoriesController);

export default router;
