import mongoose, { ObjectId, Schema } from "mongoose";
import { CategoryDoc } from "./category.model";

// Standardized product attribute types
export type ProductColor =
  | "black"
  | "white"
  | "gray"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple"
  | "pink"
  | "brown"
  | "beige"
  | "navy"
  | "teal"
  | "burgundy"
  | "olive"
  | "cream"
  | "tan"
  | "maroon"
  | "coral"
  | "silver"
  | "gold"
  | "khaki"
  | "mint"
  | "lavender";

export type ProductSize =
  | "XXS"
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL"
  | "one-size";

export type ProductMaterial =
  | "cotton"
  | "polyester"
  | "wool"
  | "silk"
  | "linen"
  | "denim"
  | "leather"
  | "suede"
  | "cashmere"
  | "nylon"
  | "spandex"
  | "rayon"
  | "velvet"
  | "satin"
  | "acrylic"
  | "modal"
  | "viscose";

export interface ProductAttributes {
  color?: ProductColor;
  size?: ProductSize;
  material?: ProductMaterial;
}

export interface ProductDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: ObjectId | Partial<CategoryDoc>;
  categoryPath?: string;
  collectionSlugs?: string[];
  price: number;
  discountedPrice?: number;
  stock: number;
  attributes: ProductAttributes;
  images: string[];
  productGroupId: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

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
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    attributes: {
      color: {
        type: String,
        enum: [
          "black",
          "white",
          "gray",
          "red",
          "blue",
          "green",
          "yellow",
          "orange",
          "purple",
          "pink",
          "brown",
          "beige",
          "navy",
          "teal",
          "burgundy",
          "olive",
          "cream",
          "tan",
          "maroon",
          "coral",
          "silver",
          "gold",
          "khaki",
          "mint",
          "lavender",
        ],
        lowercase: true,
      },
      size: {
        type: String,
        enum: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "one-size"],
        uppercase: true,
      },
      material: {
        type: String,
        enum: [
          "cotton",
          "polyester",
          "wool",
          "silk",
          "linen",
          "denim",
          "leather",
          "suede",
          "cashmere",
          "nylon",
          "spandex",
          "rayon",
          "velvet",
          "satin",
          "acrylic",
          "modal",
          "viscose",
        ],
        lowercase: true,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    productGroupId: {
      type: String,
      required: true,
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
      min: [0, "Featured order cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Auto-generate productGroupId if not provided
ProductSchema.pre("save", function (next) {
  const product = this as unknown as ProductDoc;
  if (!product.productGroupId) {
    product.productGroupId = `pg_${product._id.toString()}`;
  }
  next();
});

// Indexes
// slug ve sku için duplicate index'ler kaldırıldı (unique: true zaten index oluşturur)
ProductSchema.index({ productGroupId: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ categoryPath: 1 });
ProductSchema.index({ collectionSlugs: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ "attributes.color": 1 });
ProductSchema.index({ "attributes.size": 1 });
ProductSchema.index({ "attributes.material": 1 });
// Compound index for common filter combinations
ProductSchema.index({ "attributes.color": 1, "attributes.size": 1, price: 1 });
ProductSchema.index({ categoryId: 1, price: 1 });
ProductSchema.index({ isFeatured: 1, featuredOrder: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });

export default mongoose.model<ProductDoc>("Product", ProductSchema);
