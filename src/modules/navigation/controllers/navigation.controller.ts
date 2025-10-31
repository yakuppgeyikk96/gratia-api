import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/middlewares";
import { StatusCode } from "../../../shared/types/api.types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { getNavigationService } from "../services/navigation.services";

export const getNavigationController = asyncHandler(
  async (_req: Request, res: Response) => {
    const navigationData = await getNavigationService();

    returnSuccess(
      res,
      navigationData,
      "Navigation data fetched successfully",
      StatusCode.SUCCESS
    );
  }
);
