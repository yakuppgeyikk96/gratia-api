import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface CollectionDoc extends Document {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  collectionType: "new" | "trending" | "sale" | "featured";
  isActive: boolean;
  sortOrder: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
      maxlength: [100, "Collection name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Collection slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    collectionType: {
      type: String,
      required: [true, "Collection type is required"],
      enum: ["new", "trending", "sale", "featured"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ collectionType: 1 });
CollectionSchema.index({ isActive: 1 });

export default mongoose.model<CollectionDoc>("Collection", CollectionSchema);
