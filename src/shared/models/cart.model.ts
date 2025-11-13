import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { ProductAttributes } from "./product.model";

export interface CartItem {
  productId: ObjectId;
  sku: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
  productName: string;
  productImages: string[];
  attributes: ProductAttributes;
  isVariant: boolean;
}

export interface CartDoc extends Document {
  _id: ObjectId;
  userId: ObjectId;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema: Schema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
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
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productImages: {
      type: [String],
      default: [],
    },
    attributes: {
      color: { type: String, trim: true },
      size: { type: String, trim: true },
      material: { type: String, trim: true },
    },
    isVariant: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const CartSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      default: 0,
      min: [0, "Total items cannot be negative"],
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, "Total price cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// userId için duplicate index kaldırıldı (unique: true zaten index oluşturur)
CartSchema.index({ updatedAt: -1 });

// Pre-save hook to calculate totals
CartSchema.pre("save", function (next) {
  const cart = this as unknown as CartDoc;

  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => {
    const itemPrice = item.discountedPrice ?? item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  next();
});

export default mongoose.model<CartDoc>("Cart", CartSchema);
