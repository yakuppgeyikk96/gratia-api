export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
}

export class AppError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
