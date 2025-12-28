import { ObjectId } from "mongoose";
import { CartItem } from "../../../shared/models/cart.model";
import { Address } from "../../../shared/types";
import { OrderNumber } from "./order.types";
import { CheckoutPricing } from "./pricing.types";
import { ShippingMethod } from "./shipping.types";

// Enums
export enum CheckoutStep {
  SHIPPING = "shipping",
  SHIPPING_METHOD = "shipping_method",
  PAYMENT = "payment",
  COMPLETED = "completed",
}

export enum CheckoutStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  EXPIRED = "expired",
  ABANDONED = "abandoned",
}

export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  CASH_ON_DELIVERY = "cash_on_delivery",
}

// Cart Snapshot
export interface CartSnapshot {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

// Checkout Session
export interface CheckoutSession {
  sessionToken: string;
  currentStep: CheckoutStep;
  status: CheckoutStatus;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMethodId: ObjectId | null;
  paymentMethodType: PaymentMethodType | null;
  cartSnapshot: CartSnapshot;
  pricing: CheckoutPricing;
  expiresAt: Date;
  completedAt: Date | null;
  orderNumber: OrderNumber | null;
  createdAt: Date;
  updatedAt: Date;
  ttl: number;
}

// Request DTOs
export interface CreateCheckoutSessionDto {
  items: {
    sku: string;
    quantity: number;
  }[];
}

export interface UpdateShippingAddressDto {
  shippingAddress: Address;
  billingAddress?: Address;
  billingIsSameAsShipping: boolean;
}

export interface SelectShippingMethodDto {
  shippingMethodId: string;
}

export interface CompletePaymentDto {
  paymentMethodType: PaymentMethodType;
  paymentToken: string;
  notes?: string;
}

// Response DTOs
export interface CreateCheckoutSessionResponse {
  sessionToken: string;
  expiresAt: Date;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
}

export interface CheckoutSessionWithMeta {
  session: CheckoutSession;
  isGuest: boolean;
  canResume: boolean;
  availableShippingMethods?: ShippingMethod[];
}
