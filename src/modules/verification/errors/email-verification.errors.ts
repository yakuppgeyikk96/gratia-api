import { AppError } from "../../../shared/errors/base.errors";

export enum EmailVerificationErrorCode {
  SENDING_VERIFICATION_CODE_FAILED = "SENDING_VERIFICATION_CODE_FAILED",
  CREATING_EMAIL_VERIFICATION_FAILED = "CREATING_EMAIL_VERIFICATION_FAILED",
  VERIFYING_EMAIL_CODE_FAILED = "VERIFYING_EMAIL_CODE_FAILED",
}

export class SendingVerificationEmailError extends AppError {
  constructor(error: string = "Failed to send verification code") {
    super(
      error,
      EmailVerificationErrorCode.SENDING_VERIFICATION_CODE_FAILED as any,
      400
    );
  }
}

export class EmailVerificationFailedError extends AppError {
  constructor(error: string = "Failed to verify email code") {
    super(
      error,
      EmailVerificationErrorCode.VERIFYING_EMAIL_CODE_FAILED as any,
      400
    );
  }
}
