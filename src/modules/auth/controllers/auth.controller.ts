import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/middlewares";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { AUTH_MESSAGES } from "../constants";
import { sendVerificationCodeByEmail } from "../services/auth.services";
import { SendVerificationCodeByEmailDto } from "../types";

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const payload: SendVerificationCodeByEmailDto = req.body;

  const result = await sendVerificationCodeByEmail(payload);

  returnSuccess(res, result, AUTH_MESSAGES.VERIFICATION_CODE_SENT);
});
