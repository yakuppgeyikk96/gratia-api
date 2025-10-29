import { ProductVariant } from "../../../shared/models/product.model";

interface CreateProductDto {
  name: string;
  slug: string;
  description: string;
  sku: string;
  categoryId: string;
  collectionSlugs?: string[];
  basePrice: number;
  baseDiscountedPrice?: number;
  images?: string[];
  variants?: ProductVariant[];
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export default CreateProductDto;
