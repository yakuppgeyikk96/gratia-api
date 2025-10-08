import { Express, Router } from "express";
import authRoutes from "../modules/auth/routes/auth.routes";

const basePath = "/api";

const router: Router = Router();

export const routesConfig = (app: Express) => {
  router.use("/auth", authRoutes);
  app.use(`${basePath}`, router);
};
