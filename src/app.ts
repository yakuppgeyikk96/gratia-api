import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDB, routesConfig, validateEnvironment } from "./config";
import { initializeEmailService } from "./shared/services";

validateEnvironment();

const app = express();

connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

initializeEmailService();

routesConfig(app);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(Number(PORT), HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
