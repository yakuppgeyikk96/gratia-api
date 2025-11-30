import dotenv from "dotenv";

dotenv.config();

export const validateEnvironment = (): void => {
  const required = [
    "MONGO_URI",
    "JWT_SECRET",
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // Optional validations
  if (
    process.env.JWT_EXPIRES_IN &&
    !/^\d+[dhms]$/.test(process.env.JWT_EXPIRES_IN)
  ) {
    throw new Error('JWT_EXPIRES_IN must be in format like "30d", "7h", "60m"');
  }

  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    throw new Error("PORT must be a valid number");
  }
};
