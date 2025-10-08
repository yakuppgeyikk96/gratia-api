import { Document, model, ObjectId, Schema } from "mongoose";

export interface EmailVerificationDoc extends Document {
  _id: ObjectId;
  verificationCode: string;
  token: string;
  encryptedUserData: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailVerificationSchema = new Schema(
  {
    verificationCode: {
      type: String,
      required: [true, "Verification code is required"],
      length: [6, "Verification code must be 6 digits"],
    },
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      index: true,
    },
    encryptedUserData: {
      type: String,
      required: [true, "Encrypted user data is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: { expireAfterSeconds: 0 },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

EmailVerificationSchema.index(
  {
    verificationCode: 1,
    isUsed: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isUsed: false },
  }
);

export default model<EmailVerificationDoc>(
  "EmailVerification",
  EmailVerificationSchema
);
