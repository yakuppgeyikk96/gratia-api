interface CreateVerificationDto {
  verificationCode: string;
  token: string;
  encryptedUserData: string;
  expiresAt: Date;
  isUsed: boolean;
}

export default CreateVerificationDto;
