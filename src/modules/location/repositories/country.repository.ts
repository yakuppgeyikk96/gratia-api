import Country, { CountryDoc } from "../../../shared/models/country.model";

/**
 * Finds all countries available for shipping
 * @returns Array of available countries
 */
export const findAllCountries = async (): Promise<CountryDoc[]> => {
  return await Country.find().sort({ name: 1 }).exec();
};

/**
 * Finds country by code
 * @param code - Country code (e.g., "TR", "US")
 * @returns Country or null
 */
export const findCountryByCode = async (
  code: string
): Promise<CountryDoc | null> => {
  return await Country.findOne({ code: code.toUpperCase() });
};

/**
 * Finds country by ID
 * @param id - Country ID
 * @returns Country or null
 */
export const findCountryById = async (
  id: string
): Promise<CountryDoc | null> => {
  return await Country.findById(id);
};
