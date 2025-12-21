import { OrderNumber } from "../types";

/**
 * Generates unique order number
 * Format: ORD-YYYYMMDD-XXXXXX
 * @returns Order number with type safety
 */
export const generateOrderNumber = (): OrderNumber => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  return `ORD-${year}${month}${day}-${random}` as OrderNumber;
};
