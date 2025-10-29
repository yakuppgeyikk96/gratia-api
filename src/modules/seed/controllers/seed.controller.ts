// src/modules/seed/controllers/seed.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/middlewares";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { seedDatabaseService } from "../services/seed.service";

export const seedDatabaseController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await seedDatabaseService();

    returnSuccess(res, result, "Database seeded successfully");
  }
);
