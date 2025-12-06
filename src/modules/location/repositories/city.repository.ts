import City, { CityDoc } from "../../../shared/models/city.model";

/**
 * Finds all cities for a state that are available for shipping
 * @param stateId - State ID
 * @returns Array of available cities
 */
export const findCitiesByStateId = async (
  stateId: string
): Promise<CityDoc[]> => {
  return await City.find({
    stateId,
  })
    .sort({ name: 1 })
    .exec();
};

/**
 * Finds city by code within a state
 * @param stateId - State ID
 * @param code - City code
 * @returns City or null
 */
export const findCityByCode = async (
  stateId: string,
  code: string
): Promise<CityDoc | null> => {
  return await City.findOne({
    stateId,
    code: code.trim(),
  });
};

/**
 * Finds city by ID
 * @param id - City ID
 * @returns City or null
 */
export const findCityById = async (id: string): Promise<CityDoc | null> => {
  return await City.findById(id);
};
