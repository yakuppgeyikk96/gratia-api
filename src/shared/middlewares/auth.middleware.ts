import { NextFunction, Response } from "express";
import { AppError, ErrorCode } from "../errors/base.errors";
import { AuthRequest } from "../types";
import { verifyJwtToken } from "../utils/jwt.utils";

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError(
        "Authentication token is required",
        ErrorCode.UNAUTHORIZED
      );
    }

    const decoded = await verifyJwtToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or expired token", ErrorCode.UNAUTHORIZED);
  }
};
