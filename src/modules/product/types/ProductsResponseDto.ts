import { ProductDoc } from "../../../shared/models/product.model";

export interface FilterOptions {
  colors: string[];
  sizes: string[];
  materials: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsResponseDto {
  products: Partial<ProductDoc>[];
  filters: FilterOptions;
  pagination: PaginationInfo;
  sortOptions: string[];
}

export default ProductsResponseDto;
