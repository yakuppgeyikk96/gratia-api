import { UserAlreadyExistsError } from "@/modules/user/errors";
import { findUserByEmail } from "@/modules/user/repositories";
import { SendingVerificationEmailError } from "@/modules/verification/errors";
import { createEmailVerification } from "@/modules/verification/repositories";
import { sendVerificationCodeByEmail as sendVerificationCodeByEmailService } from "@/modules/verification/services/email-verification.services";
import { EMAIL_VERIFICATION_EXPIRATION_TIME } from "@/shared/constants/expiration.constants";
import { encrypt } from "@/shared/utils/encryption.utils";
import {
  generateUniqueToken,
  generateVerificationCode,
} from "@/shared/utils/token.utils";
import {
  SendVerificationCodeByEmailDto,
  SendVerificationCodeByEmailResult,
} from "../types";

export const sendVerificationCodeByEmail = async (
  data: SendVerificationCodeByEmailDto
): Promise<SendVerificationCodeByEmailResult> => {
  const { email } = data;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new UserAlreadyExistsError("User already exists");
  }

  const verificationCode = generateVerificationCode();
  const token = generateUniqueToken();
  const encryptedUserData = encrypt(JSON.stringify(data));
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION_TIME);
  const isUsed = false;

  const sendingEmailResult = await sendVerificationCodeByEmailService(
    email,
    verificationCode,
    expiresAt
  );

  if (!sendingEmailResult.success) {
    throw new SendingVerificationEmailError(
      sendingEmailResult.error || "Failed to send verification code"
    );
  }

  await createEmailVerification({
    verificationCode,
    token,
    encryptedUserData,
    expiresAt,
    isUsed,
  });

  return { token };
};
