import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface CityDoc extends Document {
  _id: ObjectId;
  stateId: ObjectId;
  code: string;
  name: string;
  isAvailableForShipping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema: Schema = new Schema(
  {
    stateId: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State ID is required"],
    },
    code: {
      type: String,
      required: [true, "City code is required"],
      trim: true,
      maxlength: [20, "City code cannot exceed 20 characters"],
    },
    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
      maxlength: [100, "City name cannot exceed 100 characters"],
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
CitySchema.index({ stateId: 1, code: 1 }, { unique: true });
CitySchema.index({ stateId: 1, isAvailableForShipping: 1 });
CitySchema.index({ isAvailableForShipping: 1 });

export default mongoose.model<CityDoc>("City", CitySchema);
