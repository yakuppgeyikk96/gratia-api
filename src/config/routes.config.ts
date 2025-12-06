import { Express, Router } from "express";
import authRoutes from "../modules/auth/routes/auth.routes";
import cartRoutes from "../modules/cart/routes/cart.routes";
import categoryRoutes from "../modules/category/routes/category.routes";
import checkoutRoutes from "../modules/checkout/routes/checkout.routes";
import collectionRoutes from "../modules/collection/routes/collection.routes";
import locationRoutes from "../modules/location/routes/location.routes";
import navigationRoutes from "../modules/navigation/routes/navigation.routes";
import productRoutes from "../modules/product/routes/product.routes";
import seedRoutes from "../modules/seed/routes/seed.routes";
import { authMiddleware } from "../shared/middlewares";

const basePath = "/api";

const router: Router = Router();

export const routesConfig = (app: Express) => {
  router.use("/auth", authRoutes);
  router.use("/categories", categoryRoutes);
  router.use("/collections", collectionRoutes);
  router.use("/products", productRoutes);
  router.use("/seed", seedRoutes);
  router.use("/navigation", navigationRoutes);

  // Public routes (authenticated and guest users)
  router.use("/checkout", checkoutRoutes);
  router.use("/location", locationRoutes);

  // Protected routes
  router.use("/cart", authMiddleware, cartRoutes);

  app.use(`${basePath}`, router);
};
