import { ProductAttributes } from "../../../shared/models/product.model";

interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: string;
  collectionSlugs?: string[];
  price: number;
  discountedPrice?: number;
  stock: number;
  attributes?: ProductAttributes;
  images?: string[];
  productGroupId?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export default CreateProductDto;
