export interface CheckoutPricing {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax?: number;
  total: number;
}
