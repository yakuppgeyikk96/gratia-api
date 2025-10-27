import Collection, {
  CollectionDoc,
} from "../../../shared/models/collection.model";
import CreateCollectionDto from "../types/CreateCollectionDto";

export const createCollection = async (
  collectionData: CreateCollectionDto
): Promise<CollectionDoc> => {
  const collection = new Collection(collectionData);
  return await collection.save();
};

export const findCollectionBySlug = async (
  slug: string
): Promise<CollectionDoc | null> => {
  return await Collection.findOne({ slug: slug.toLowerCase() });
};

export const findCollectionById = async (
  id: string
): Promise<CollectionDoc | null> => {
  return await Collection.findById(id);
};

export const findAllCollections = async (): Promise<CollectionDoc[]> => {
  return await Collection.find().sort({ sortOrder: 1, name: 1 });
};

export const findCollectionsByType = async (
  collectionType: "new" | "trending" | "sale" | "featured"
): Promise<CollectionDoc[]> => {
  return await Collection.find({ collectionType }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const findActiveCollections = async (): Promise<CollectionDoc[]> => {
  return await Collection.find({ isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
};
