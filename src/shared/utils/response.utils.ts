import { Response } from "express";
import { AppError, ErrorCode } from "../errors/base.errors";
import { IApiErrorResponse, IApiSuccessResponse } from "../types";

export const returnSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): void => {
  const response: IApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const returnError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errorCode?: ErrorCode,
  errors?: string[]
): void => {
  const response: IApiErrorResponse = {
    success: false,
    message,
    errors: errors || [],
    errorCode: errorCode || "",
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const handleError = (res: Response, error: AppError): void => {
  returnError(res, error.message, error.statusCode, error.errorCode);
};

export const validationError = (
  res: Response,
  errors: string[],
  message: string = "Validation error"
): void => {
  returnError(res, message, 400, ErrorCode.VALIDATION_ERROR, errors);
};

export const conflictError = (
  res: Response,
  message: string = "Resource already exists"
): void => {
  returnError(res, message, 409, ErrorCode.CONFLICT);
};

export const internalError = (
  res: Response,
  message: string = "Internal server error"
): void => {
  returnError(res, message, 500, ErrorCode.INTERNAL_SERVER_ERROR);
};

export const responseUtils = {
  returnSuccess,
  returnError,
  handleError,
  conflictError,
  internalError,
};
