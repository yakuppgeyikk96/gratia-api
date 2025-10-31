import { Router } from "express";
import { getNavigationController } from "../controllers/navigation.controller";

const router: Router = Router();

router.get("/", getNavigationController);

export default router;
