export interface ShippingMethod {
  _id: string;
  name: string;
  carrier: string;
  description?: string;
  estimatedDays: string;
  price: number;
  isFree: boolean;
}
