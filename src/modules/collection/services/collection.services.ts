import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { CollectionDoc } from "../../../shared/models/collection.model";
import { COLLECTION_MESSAGES } from "../constants/collection.constants";
import {
  createCollection,
  findActiveCollections,
  findAllCollections,
  findCollectionById,
  findCollectionBySlug,
  findCollectionsByType,
} from "../repositories";
import CreateCollectionDto from "../types/CreateCollectionDto";

export const createCollectionService = async (
  data: CreateCollectionDto
): Promise<CollectionDoc> => {
  const existingCollection = await findCollectionBySlug(data.slug);

  if (existingCollection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  const collection = await createCollection(data);

  if (!collection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return collection;
};

export const getAllCollectionsService = async (): Promise<CollectionDoc[]> => {
  return await findAllCollections();
};

export const getActiveCollectionsService = async (): Promise<
  CollectionDoc[]
> => {
  return await findActiveCollections();
};

export const getCollectionByIdService = async (
  id: string
): Promise<CollectionDoc> => {
  const collection = await findCollectionById(id);

  if (!collection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return collection;
};

export const getCollectionBySlugService = async (
  slug: string
): Promise<CollectionDoc> => {
  const collection = await findCollectionBySlug(slug);

  if (!collection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return collection;
};

export const getCollectionsByTypeService = async (
  type: "new" | "trending" | "sale" | "featured"
): Promise<CollectionDoc[]> => {
  return await findCollectionsByType(type);
};
