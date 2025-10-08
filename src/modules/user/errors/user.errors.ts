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
