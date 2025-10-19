import { Router } from "express";
import { validateBody } from "../../../shared/middlewares/validation.middleware";
import { createUserSchema } from "../../user/validations";
import {
  loginUserController,
  registerUserController,
  verifyEmailController,
} from "../controllers/auth.controller";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validations/auth.validations";

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

router.post("/login", validateBody(loginUserSchema), loginUserController);

export default router;
