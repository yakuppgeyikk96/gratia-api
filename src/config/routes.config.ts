import { Express, Router } from "express";
import authRoutes from "../modules/auth/routes/auth.routes";
import categoryRoutes from "../modules/category/routes/category.routes";
import collectionRoutes from "../modules/collection/routes/collection.routes";
import productRoutes from "../modules/product/routes/product.routes";

const basePath = "/api";

const router: Router = Router();

export const routesConfig = (app: Express) => {
  router.use("/auth", authRoutes);
  router.use("/categories", categoryRoutes);
  router.use("/collections", collectionRoutes);
  router.use("/products", productRoutes);

  app.use(`${basePath}`, router);
};
