import cors from "cors";
import express from "express";
import helmet from "helmet";
import {
  connectDB,
  connectRedis,
  routesConfig,
  validateEnvironment,
} from "./config";
import {
  getRedisKeyTTL,
  getRedisValue,
  initializeEmailService,
  setRedisValue,
} from "./shared/services";

validateEnvironment();

const app = express();

connectDB();
connectRedis();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

initializeEmailService();

app.get("/health", (_req, res) => {
  res.send({ status: "ok" });
});

app.get("/test-redis", async (_req, res) => {
  try {
    await setRedisValue(
      "checkout:test:session-123",
      {
        userId: "user-123",
        cartTotal: 1299.99,
        createdAt: new Date().toISOString(),
      },
      20
    );

    const session = await getRedisValue("checkout:test:session-123");

    const ttl = await getRedisKeyTTL("checkout:test:session-123");

    res.json({
      success: true,
      session,
      ttlSeconds: ttl,
    });
  } catch (error) {
    res.json({ success: false, error: (error as Error).message });
  }
});

routesConfig(app);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(Number(PORT), HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
