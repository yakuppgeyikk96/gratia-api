import { Router } from "express";
import { seedDatabaseController } from "../controllers/seed.controller";

const router: Router = Router();

router.post("/", seedDatabaseController);

export default router;
