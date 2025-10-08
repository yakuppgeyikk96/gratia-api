import { randomBytes } from "crypto";

export const generateUniqueToken = (): string => {
  return randomBytes(32).toString("hex");
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
