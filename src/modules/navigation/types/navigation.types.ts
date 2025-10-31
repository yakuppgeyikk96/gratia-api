export interface NavigationItem {
  type: "category" | "collection";
  name: string;
  slug: string;
}

export interface NavigationCategoryItem extends NavigationItem {
  type: "category";
}

export interface NavigationCollectionItem extends NavigationItem {
  type: "collection";
}

export interface NavigationResponse {
  collections: NavigationCollectionItem[];
  categories: NavigationCategoryItem[];
}
