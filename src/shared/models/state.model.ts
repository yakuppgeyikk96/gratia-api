import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface StateDoc extends Document {
  _id: ObjectId;
  countryId: ObjectId;
  code: string;
  name: string;
  isAvailableForShipping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StateSchema: Schema = new Schema(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country ID is required"],
    },
    code: {
      type: String,
      required: [true, "State code is required"],
      uppercase: true,
      trim: true,
      maxlength: [10, "State code cannot exceed 10 characters"],
    },
    name: {
      type: String,
      required: [true, "State name is required"],
      trim: true,
      maxlength: [100, "State name cannot exceed 100 characters"],
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
StateSchema.index({ countryId: 1, code: 1 }, { unique: true });
StateSchema.index({ countryId: 1, isAvailableForShipping: 1 });
StateSchema.index({ isAvailableForShipping: 1 });

export default mongoose.model<StateDoc>("State", StateSchema);
