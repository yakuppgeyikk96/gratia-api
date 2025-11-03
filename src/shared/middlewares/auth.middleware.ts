import { NextFunction, Response } from "express";
import { ErrorCode } from "../errors/base.errors";
import { AuthRequest, IApiErrorResponse } from "../types";
import { verifyJwtToken } from "../utils/jwt.utils";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      const noAuthResponse: IApiErrorResponse = {
        success: false,
        message: "Authentication token is required",
        errors: [],
        errorCode: ErrorCode.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      };
      return res.send(noAuthResponse);
    }

    const decoded = await verifyJwtToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    return res.send({
      success: false,
      message: "Invalid or expired token",
      errors: [],
      errorCode: ErrorCode.UNAUTHORIZED,
      timestamp: new Date().toISOString(),
    });
  }
};
