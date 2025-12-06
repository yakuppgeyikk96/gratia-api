import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/middlewares/async-handler.middleware";
import { StatusCode } from "../../../shared/types/api.types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import {
  getAllCountriesService,
  getCitiesByStateService,
  getCountryByCodeService,
  getStatesByCountryService,
} from "../services/location.service";

/**
 * Get all countries
 * Public endpoint
 */
export const getAllCountriesController = asyncHandler(
  async (_req: Request, res: Response) => {
    const countries = await getAllCountriesService();

    returnSuccess(
      res,
      countries,
      "Countries retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get country by code
 * Public endpoint
 */
export const getCountryByCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.params;

    const country = await getCountryByCodeService(code!);

    returnSuccess(
      res,
      country,
      "Country retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get all states for a country
 * Public endpoint
 */
export const getStatesByCountryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { countryId } = req.params;

    const states = await getStatesByCountryService(countryId!);

    returnSuccess(
      res,
      states,
      "States retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);

/**
 * Get all cities for a state
 * Public endpoint
 */
export const getCitiesByStateController = asyncHandler(
  async (req: Request, res: Response) => {
    const { stateId } = req.params;

    const cities = await getCitiesByStateService(stateId!);

    returnSuccess(
      res,
      cities,
      "Cities retrieved successfully",
      StatusCode.SUCCESS
    );
  }
);
