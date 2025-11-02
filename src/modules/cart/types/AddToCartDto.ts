import { ProductVariantAttributes } from "../../../shared/models/product.model";

export interface AddToCartDto {
  productId: string;
  sku: string;
  quantity: number;
  attributes?: ProductVariantAttributes;
}

export default AddToCartDto;
