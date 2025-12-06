import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CityDoc, CountryDoc, StateDoc } from "../../../shared/models";
import { LOCATION_MESSAGES } from "../constants/location.constants";
import {
  findAllCountries,
  findCitiesByStateId,
  findCityByCode,
  findCityById,
  findCountryByCode,
  findCountryById,
  findStateByCode,
  findStateById,
  findStatesByCountryId,
} from "../repositories";

/**
 * Gets all countries
 * @returns Array of countries
 */
export const getAllCountriesService = async (): Promise<CountryDoc[]> => {
  return await findAllCountries();
};

/**
 * Gets country by code
 * @param code - Country code
 * @returns Country
 */
export const getCountryByCodeService = async (
  code: string
): Promise<CountryDoc> => {
  const country = await findCountryByCode(code);

  if (!country) {
    throw new AppError(
      LOCATION_MESSAGES.COUNTRY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return country;
};

/**
 * Gets country by ID
 * @param id - Country ID
 * @returns Country
 */
export const getCountryByIdService = async (
  id: string
): Promise<CountryDoc> => {
  const country = await findCountryById(id);

  if (!country) {
    throw new AppError(
      LOCATION_MESSAGES.COUNTRY_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return country;
};

/**
 * Gets all states for a country
 * @param countryId - Country ID
 * @returns Array of states
 */
export const getStatesByCountryService = async (
  countryId: string
): Promise<StateDoc[]> => {
  // Validate country exists
  await getCountryByIdService(countryId);

  return await findStatesByCountryId(countryId);
};

/**
 * Gets state by code within a country
 * @param countryId - Country ID
 * @param code - State code
 * @returns State
 */
export const getStateByCodeService = async (
  countryId: string,
  code: string
): Promise<StateDoc> => {
  // Validate country exists
  await getCountryByIdService(countryId);

  const state = await findStateByCode(countryId, code);

  if (!state) {
    throw new AppError(LOCATION_MESSAGES.STATE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return state;
};

/**
 * Gets state by ID
 * @param id - State ID
 * @returns State
 */
export const getStateByIdService = async (id: string): Promise<StateDoc> => {
  const state = await findStateById(id);

  if (!state) {
    throw new AppError(LOCATION_MESSAGES.STATE_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  // ✅ isAvailableForShipping kontrolü kaldırıldı

  return state;
};

/**
 * Gets all cities for a state
 * @param stateId - State ID
 * @returns Array of cities
 */
export const getCitiesByStateService = async (
  stateId: string
): Promise<CityDoc[]> => {
  // Validate state exists
  await getStateByIdService(stateId);

  return await findCitiesByStateId(stateId);
};

/**
 * Gets city by code within a state
 * @param stateId - State ID
 * @param code - City code
 * @returns City
 */
export const getCityByCodeService = async (
  stateId: string,
  code: string
): Promise<CityDoc> => {
  // Validate state exists
  await getStateByIdService(stateId);

  const city = await findCityByCode(stateId, code);

  if (!city) {
    throw new AppError(LOCATION_MESSAGES.CITY_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return city;
};

/**
 * Gets city by ID
 * @param id - City ID
 * @returns City
 */
export const getCityByIdService = async (id: string): Promise<CityDoc> => {
  const city = await findCityById(id);

  if (!city) {
    throw new AppError(LOCATION_MESSAGES.CITY_NOT_FOUND, ErrorCode.NOT_FOUND);
  }

  return city;
};

/**
 * Gets all states for a country by country code
 * @param code - Country code (e.g., "US", "TR")
 * @returns Array of states
 */
export const getStatesByCountryCodeService = async (
  code: string
): Promise<StateDoc[]> => {
  // Get country by code
  const country = await getCountryByCodeService(code);

  // Get states by country ID
  return await findStatesByCountryId(country._id.toString());
};

/**
 * Gets all cities for a state by country code and state code
 * @param countryCode - Country code (e.g., "US", "TR")
 * @param stateCode - State code (e.g., "CA", "IST")
 * @returns Array of cities
 */
export const getCitiesByStateCodeService = async (
  countryCode: string,
  stateCode: string
): Promise<CityDoc[]> => {
  // Get country by code
  const country = await getCountryByCodeService(countryCode);

  // Get state by code within country
  const state = await getStateByCodeService(country._id.toString(), stateCode);

  // Get cities by state ID
  return await findCitiesByStateId(state._id.toString());
};
