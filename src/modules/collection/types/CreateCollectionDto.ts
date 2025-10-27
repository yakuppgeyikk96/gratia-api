interface CreateCollectionDto {
  name: string;
  slug: string;
  description?: string;
  collectionType: "new" | "trending" | "sale" | "featured";
  isActive?: boolean;
  sortOrder?: number;
  imageUrl?: string;
}

export default CreateCollectionDto;
