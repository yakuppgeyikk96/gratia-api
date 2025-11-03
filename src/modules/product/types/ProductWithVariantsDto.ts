import { ProductDoc } from "../../../shared/models/product.model";

export interface ProductWithVariantsDto {
  product: ProductDoc;
  variants: ProductDoc[];
  availableOptions: {
    colors: string[];
    sizes: string[];
    materials: string[];
  };
}

export default ProductWithVariantsDto;
