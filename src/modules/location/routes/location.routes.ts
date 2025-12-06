import { Router } from "express";
import { validateParams } from "../../../shared/middlewares";
import {
  getAllCountriesController,
  getCitiesByStateCodeController,
  getCitiesByStateController,
  getCountryByCodeController,
  getStatesByCountryCodeController,
  getStatesByCountryController,
} from "../controllers/location.controller";
import {
  countryCodeParamsSchema,
  countryIdParamsSchema,
  stateCodeParamsSchema,
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

// GET /api/location/countries/:code/states - Get states by country code
router.get(
  "/countries/:code/states",
  validateParams(countryCodeParamsSchema),
  getStatesByCountryCodeController
);

// GET /api/location/countries/:countryId/states - Get states by country ID
router.get(
  "/countries/:countryId/states",
  validateParams(countryIdParamsSchema),
  getStatesByCountryController
);

// GET /api/location/countries/:countryCode/states/:stateCode/cities - Get cities by country code and state code
router.get(
  "/countries/:countryCode/states/:stateCode/cities",
  validateParams(stateCodeParamsSchema),
  getCitiesByStateCodeController
);

// GET /api/location/states/:stateId/cities - Get cities by state ID
router.get(
  "/states/:stateId/cities",
  validateParams(stateIdParamsSchema),
  getCitiesByStateController
);

export default router;
