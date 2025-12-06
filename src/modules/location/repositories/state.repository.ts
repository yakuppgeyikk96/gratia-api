import State, { StateDoc } from "../../../shared/models/state.model";

/**
 * Finds all states for a country that are available for shipping
 * @param countryId - Country ID
 * @returns Array of available states
 */
export const findStatesByCountryId = async (
  countryId: string
): Promise<StateDoc[]> => {
  return await State.find({ countryId }).sort({ name: 1 }).exec();
};

/**
 * Finds state by code within a country
 * @param countryId - Country ID
 * @param code - State code (e.g., "NY", "CA")
 * @returns State or null
 */
export const findStateByCode = async (
  countryId: string,
  code: string
): Promise<StateDoc | null> => {
  return await State.findOne({
    countryId,
    code: code.toUpperCase(),
  });
};

/**
 * Finds state by ID
 * @param id - State ID
 * @returns State or null
 */
export const findStateById = async (id: string): Promise<StateDoc | null> => {
  return await State.findById(id);
};
