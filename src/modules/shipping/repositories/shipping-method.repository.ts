import ShippingMethod, {
  ShippingMethodDoc,
} from "../../../shared/models/shipping-method.model";

/**
 * Finds all active shipping methods, sorted by sortOrder
 * @returns Array of active shipping methods
 */
export const findAllActiveShippingMethods = async (): Promise<
  ShippingMethodDoc[]
> => {
  return await ShippingMethod.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .exec();
};

/**
 * Finds shipping method by ID
 * @param id - Shipping method ID
 * @returns Shipping method or null
 */
export const findShippingMethodById = async (
  id: string
): Promise<ShippingMethodDoc | null> => {
  return await ShippingMethod.findById(id);
};

/**
 * Finds available shipping methods for a specific country
 * @param country - Country code (e.g., "TR", "US")
 * @returns Array of available shipping methods
 */
export const findAvailableShippingMethodsByCountry = async (
  country: string
): Promise<ShippingMethodDoc[]> => {
  return await ShippingMethod.find({
    isActive: true,
    $or: [
      { availableCountries: { $size: 0 } }, // Available in all countries
      { availableCountries: country }, // Available in specific country
    ],
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .exec();
};

/**
 * Finds shipping method by ID and validates it's active
 * @param id - Shipping method ID
 * @returns Shipping method or null
 */
export const findShippingMethodByIdAndValidate = async (
  id: string
): Promise<ShippingMethodDoc | null> => {
  return await ShippingMethod.findOne({
    _id: id,
    isActive: true,
  });
};
