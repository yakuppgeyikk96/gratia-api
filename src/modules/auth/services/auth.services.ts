import bcrypt from "bcryptjs";
import {
  UserAlreadyExistsError,
  UserCreationFailedError,
  UserNotFoundError,
} from "../../../modules/user/errors";
import {
  createUser,
  findUserByEmail,
} from "../../../modules/user/repositories";
import { createUserSchema } from "../../../modules/user/validations";
import {
  EmailVerificationFailedError,
  SendingVerificationEmailError,
} from "../../../modules/verification/errors";
import {
  createEmailVerification,
  verifyEmailCode,
} from "../../../modules/verification/repositories";
import { sendVerificationCodeByEmail as sendVerificationCodeByEmailService } from "../../../modules/verification/services/email-verification.services";
import { EMAIL_VERIFICATION_EXPIRATION_TIME } from "../../../shared/constants/expiration.constants";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { decrypt, encrypt } from "../../../shared/utils/encryption.utils";
import { generateJwtToken } from "../../../shared/utils/jwt.utils";
import {
  generateUniqueToken,
  generateVerificationCode,
} from "../../../shared/utils/token.utils";
import {
  SendVerificationCodeByEmailDto,
  SendVerificationCodeByEmailResult,
} from "../types";
import { LoginUserDto } from "../types/LoginUserDto";
import { LoginUserResult } from "../types/LoginUserResult";
import { RegisterUserDto } from "../types/RegisterUserDto";
import { RegisterUserResult } from "../types/RegisterUserResult";

export const sendVerificationCodeByEmail = async (
  data: SendVerificationCodeByEmailDto
): Promise<SendVerificationCodeByEmailResult> => {
  const { email } = data;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new UserAlreadyExistsError(email);
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
    throw new SendingVerificationEmailError();
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

export const registerUser = async (
  data: RegisterUserDto
): Promise<RegisterUserResult> => {
  const { token, code } = data;

  const verifiedEmailData = await verifyEmailCode(token, code);

  if (!verifiedEmailData) {
    throw new EmailVerificationFailedError();
  }

  const decryptedUserData = decrypt(verifiedEmailData.encryptedUserData);

  const userData = JSON.parse(decryptedUserData);

  const validatedUserData = createUserSchema.parse(userData);

  const user = await createUser(validatedUserData);

  if (!user) {
    throw new UserCreationFailedError();
  }

  const jwtToken = await generateJwtToken({
    userId: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return { user, token: jwtToken };
};

export const loginUser = async (
  data: LoginUserDto
): Promise<LoginUserResult> => {
  const { email, password } = data;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new UserNotFoundError(email);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", ErrorCode.INVALID_CREDENTIALS);
  }

  const jwtToken = await generateJwtToken({
    userId: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return { user, token: jwtToken };
};
