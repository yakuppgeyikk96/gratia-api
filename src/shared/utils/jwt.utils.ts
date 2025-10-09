import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { JwtErrorCode } from "../errors/jwt.errors";

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

const jwtSecretParam = process.env.JWT_SECRET;
const jwtExpiresInParam = process.env.JWT_EXPIRES_IN || "1h";

if (!jwtSecretParam) {
  throw new Error("JWT_SECRET is not set");
}

const jwtSecret = new TextEncoder().encode(jwtSecretParam);

export const generateJwtToken = async (
  payload: JwtPayload
): Promise<string> => {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(jwtExpiresInParam)
      .sign(jwtSecret);

    return token;
  } catch (error) {
    throw new Error(JwtErrorCode.JWT_GENERATION_FAILED);
  }
};

export const verifyJwtToken = async (token: string): Promise<JwtPayload> => {
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload as JwtPayload;
  } catch (error) {
    throw new Error(JwtErrorCode.JWT_VERIFICATION_FAILED);
  }
};
