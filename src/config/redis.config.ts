import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<void> => {
  const redisHost = process.env.REDIS_HOST as string;
  const redisPort = process.env.REDIS_PORT as string;
  const redisUsername = process.env.REDIS_USERNAME as string;
  const redisPassword = process.env.REDIS_PASSWORD as string;

  console.log("Connecting to Redis...");

  try {
    if (!redisHost || !redisPort || !redisUsername || !redisPassword) {
      throw new Error("Redis configuration is missing");
    }

    redisClient = createClient({
      username: redisUsername,
      password: redisPassword,
      socket: {
        host: redisHost,
        port: Number(redisPort),
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("--------------------------------");
      console.log("✅ Redis connected successfully");
      console.log(`- Host: ${redisHost}`);
      console.log(`- Port: ${redisPort}`);
      console.log("--------------------------------");
    });

    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection error:", error);
    process.exit(1);
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    console.log("Redis disconnected");
  }
};
