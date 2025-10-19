import { AppError } from "../../../shared/errors/base.errors";

export enum UserErrorCode {
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE",
  USER_CREATION_FAILED = "USER_CREATION_FAILED",
}

export class UserNotFoundError extends AppError {
  constructor(email: string) {
    super(
      `User with email ${email} not found`,
      UserErrorCode.USER_NOT_FOUND as any,
      404
    );
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(
      `User with email ${email} already exists`,
      UserErrorCode.USER_ALREADY_EXISTS as any,
      409
    );
  }
}

export class UserCreationFailedError extends AppError {
  constructor() {
    super(
      "User creation failed due to an unknown error",
      UserErrorCode.USER_CREATION_FAILED as any,
      500
    );
  }
}
