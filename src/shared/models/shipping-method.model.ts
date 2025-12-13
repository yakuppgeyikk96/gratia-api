import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface ShippingMethodDoc extends Document {
  _id: ObjectId;
  name: string;
  carrier: string;
  description?: string;
  estimatedDays: string;
  price: number;
  isFree: boolean;
  isActive: boolean;
  minOrderAmount?: number;
  availableCountries?: string[];
  imageUrl?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingMethodSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Shipping method name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    carrier: {
      type: String,
      required: [true, "Carrier is required"],
      trim: true,
      maxlength: [50, "Carrier cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    estimatedDays: {
      type: String,
      required: [true, "Estimated days is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minOrderAmount: {
      type: Number,
      min: [0, "Minimum order amount cannot be negative"],
    },
    availableCountries: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ShippingMethodSchema.index({ isActive: 1, sortOrder: 1 });
ShippingMethodSchema.index({ availableCountries: 1 });

export default mongoose.model<ShippingMethodDoc>(
  "ShippingMethod",
  ShippingMethodSchema
);
