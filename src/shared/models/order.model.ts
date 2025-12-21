import mongoose, { Document, ObjectId, Schema } from "mongoose";
import { Address } from "../types";
import { CartItem } from "./cart.model";

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface OrderDoc extends Document {
  _id: ObjectId;
  orderNumber: string;
  userId?: ObjectId;
  email: string;
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId: ObjectId;
  paymentMethodType: string;
  paymentIntentId?: string;
  pricing: {
    subtotal: number;
    shippingCost: number;
    discount: number;
    tax?: number;
    total: number;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema(
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

const AddressSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
  },
  { _id: false }
);

const PricingSchema: Schema = new Schema(
  {
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    shippingCost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: [0, "Shipping cost cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    items: {
      type: [OrderItemSchema],
      required: [true, "Items are required"],
      validate: {
        validator: (items: CartItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: {
      type: AddressSchema,
      required: [true, "Shipping address is required"],
    },
    billingAddress: {
      type: AddressSchema,
      required: [true, "Billing address is required"],
    },
    shippingMethodId: {
      type: Schema.Types.ObjectId,
      ref: "ShippingMethod",
      required: [true, "Shipping method is required"],
    },
    paymentMethodType: {
      type: String,
      required: [true, "Payment method type is required"],
      enum: {
        values: ["credit_card", "bank_transfer", "cash_on_delivery"],
        message: "Invalid payment method type",
      },
    },
    paymentIntentId: {
      type: String,
      trim: true,
    },
    pricing: {
      type: PricingSchema,
      required: [true, "Pricing is required"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(OrderStatus),
        message: "Invalid order status",
      },
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PaymentStatus),
        message: "Invalid payment status",
      },
      default: PaymentStatus.PENDING,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ paymentIntentId: 1 });

export default mongoose.model<OrderDoc>("Order", OrderSchema);
