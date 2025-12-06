import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface CountryDoc extends Document {
  _id: ObjectId;
  code: string;
  name: string;
  isAvailableForShipping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Country code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      length: [2, "Country code must be 2 characters"],
    },
    name: {
      type: String,
      required: [true, "Country name is required"],
      trim: true,
      maxlength: [100, "Country name cannot exceed 100 characters"],
    },
    isAvailableForShipping: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CountrySchema.index({ code: 1 }, { unique: true });
CountrySchema.index({ isAvailableForShipping: 1 });

export default mongoose.model<CountryDoc>("Country", CountrySchema);
