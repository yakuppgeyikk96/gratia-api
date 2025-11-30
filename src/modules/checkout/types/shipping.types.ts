import { ObjectId } from "mongoose";

export interface ShippingMethod {
  _id: ObjectId;
  name: string;
  carrier: string;
  description?: string;
  estimatedDays: string;
  price: number;
  isFree: boolean;
}
