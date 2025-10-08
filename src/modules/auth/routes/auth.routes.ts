import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import { verifyEmail } from "../controllers/auth.controller";
import { verifyEmailSchema } from "../validations/auth.validations";

const router: Router = Router();

router.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);

export default router;
