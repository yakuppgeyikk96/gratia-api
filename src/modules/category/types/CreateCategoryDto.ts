export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}
