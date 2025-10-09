import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import { createUserSchema } from "../../user/validations";
import {
  registerUserController,
  verifyEmailController,
} from "../controllers/auth.controller";
import { registerUserSchema } from "../validations/auth.validations";

const router: Router = Router();

router.post(
  "/verify-email",
  validateBody(createUserSchema),
  verifyEmailController
);
router.post(
  "/register",
  validateBody(registerUserSchema),
  registerUserController
);

export default router;
