import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/base.errors";
import { handleError, internalError } from "../utils/response.utils";

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (error instanceof AppError) {
        handleError(res, error);
      } else {
        internalError(res, error.message || "Internal server error");
      }
    });
  };
};
