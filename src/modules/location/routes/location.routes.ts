import { Router } from "express";
import { validateParams } from "../../../shared/middlewares";
import {
  getAllCountriesController,
  getCitiesByStateController,
  getCountryByCodeController,
  getStatesByCountryController,
} from "../controllers/location.controller";
import {
  countryCodeParamsSchema,
  countryIdParamsSchema,
  stateIdParamsSchema,
} from "../validations/location.validations";

const router: Router = Router();

// GET /api/location/countries - Get all countries
router.get("/countries", getAllCountriesController);

// GET /api/location/countries/:code - Get country by code
router.get(
  "/countries/:code",
  validateParams(countryCodeParamsSchema),
  getCountryByCodeController
);

// GET /api/location/countries/:countryId/states - Get states by country
router.get(
  "/countries/:countryId/states",
  validateParams(countryIdParamsSchema),
  getStatesByCountryController
);

// GET /api/location/states/:stateId/cities - Get cities by state
router.get(
  "/states/:stateId/cities",
  validateParams(stateIdParamsSchema),
  getCitiesByStateController
);

export default router;
