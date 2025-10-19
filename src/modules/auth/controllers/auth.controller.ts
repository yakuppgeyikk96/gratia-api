import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/middlewares";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { AUTH_MESSAGES } from "../constants";
import {
  loginUser,
  registerUser,
  sendVerificationCodeByEmail,
} from "../services/auth.services";
import { SendVerificationCodeByEmailDto } from "../types";
import { LoginUserDto } from "../types/LoginUserDto";
import { RegisterUserDto } from "../types/RegisterUserDto";

export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: SendVerificationCodeByEmailDto = req.body;

    const result = await sendVerificationCodeByEmail(payload);

    returnSuccess(res, result, AUTH_MESSAGES.VERIFICATION_CODE_SENT);
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: RegisterUserDto = req.body;

    const result = await registerUser(payload);

    returnSuccess(res, result, AUTH_MESSAGES.USER_REGISTERED);
  }
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: LoginUserDto = req.body;

    const result = await loginUser(payload);

    returnSuccess(res, result, AUTH_MESSAGES.USER_LOGGED_IN);
  }
);
