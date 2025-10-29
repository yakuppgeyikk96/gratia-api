import mongoose, { ObjectId, Schema } from "mongoose";
import { CategoryDoc } from "./category.model";

export interface ProductVariantAttributes {
  color?: string;
  size?: string;
  material?: string;
  brand?: string;
  style?: string;
  pattern?: string;
}

export interface ProductVariant {
  attributes: ProductVariantAttributes;
  sku: string;
  stock: number;
  price?: number;
  discountedPrice?: number;
}

export interface ProductDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: ObjectId | Partial<CategoryDoc>;
  categoryPath?: string; // Example: "men#shoes#sneakers"
  collectionSlugs?: string[];
  basePrice: number;
  baseDiscountedPrice?: number;
  images: string[];
  variants: ProductVariant[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema: Schema = new Schema(
  {
    attributes: {
      color: { type: String, trim: true },
      size: { type: String, trim: true },
      material: { type: String, trim: true },
      brand: { type: String, trim: true },
      style: { type: String, trim: true },
      pattern: { type: String, trim: true },
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
  },
  { _id: false }
);

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Please enter a valid slug"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    categoryPath: {
      type: String,
      trim: true,
    },
    collectionSlugs: {
      type: [String],
      default: [],
      validate: {
        validator: (slugs: string[]) => {
          return slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
        },
        message: "Invalid collection slug format",
      },
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
    },
    baseDiscountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ categoryPath: 1 });
ProductSchema.index({ collectionSlugs: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ "variants.attributes.color": 1 });
ProductSchema.index({ "variants.attributes.size": 1 });

export default mongoose.model<ProductDoc>("Product", ProductSchema);
