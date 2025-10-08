import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || "";
const IV_LENGTH = 16;

if (!SECRET_KEY) {
  throw new Error("ENCRYPTION_SECRET_KEY is not set");
}

const key = createHash("sha256")
  .update(SECRET_KEY)
  .digest("hex")
  .substring(0, 32);

const iv = randomBytes(IV_LENGTH);

export const encrypt = (data: string): string => {
  const cipher = createCipheriv(ALGORITHM, Buffer.from(key), iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
};

export function decrypt(data: string) {
  const inputIV = data.slice(0, 32);
  const encrypted = data.slice(32);
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(key),
    Buffer.from(inputIV, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}
