import EmailVerification, {
  EmailVerificationDoc,
} from "../../../shared/models/email-verification.model";
import CreateVerificationDto from "../types/CreateVerificationDto";

export const createEmailVerification = async (
  data: CreateVerificationDto
): Promise<EmailVerificationDoc> => {
  const { verificationCode, token, encryptedUserData, expiresAt, isUsed } =
    data;

  await deleteExpiredEmailVerifications(token);

  const emailVerification = new EmailVerification({
    token,
    encryptedUserData,
    verificationCode,
    expiresAt,
    isUsed,
  });

  return await emailVerification.save();
};

export const verifyEmailCode = async (
  token: string,
  code: string
): Promise<EmailVerificationDoc | null> => {
  const verification = await EmailVerification.findOne({
    token,
    verificationCode: code,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (verification) {
    verification.isUsed = true;
    await verification.save();
  }

  return verification;
};

export const deleteExpiredEmailVerifications = async (
  token: string
): Promise<void> => {
  await EmailVerification.deleteMany({
    token,
    $or: [{ expiresAt: { $lt: new Date() } }, { isUsed: true }],
  });
};
