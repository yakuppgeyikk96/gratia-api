import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { asyncHandler } from "../../../shared/middlewares";
import { StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { COLLECTION_MESSAGES } from "../constants/collection.constants";
import {
  createCollectionService,
  getActiveCollectionsService,
  getAllCollectionsService,
  getCollectionByIdService,
  getCollectionBySlugService,
  getCollectionsByTypeService,
} from "../services/collection.services";
import CreateCollectionDto from "../types/CreateCollectionDto";

export const createCollectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateCollectionDto = req.body;

    const result = await createCollectionService(payload);

    returnSuccess(
      res,
      result,
      COLLECTION_MESSAGES.COLLECTION_CREATED,
      StatusCode.CREATED
    );
  }
);

export const getAllCollectionsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getAllCollectionsService();

    returnSuccess(
      res,
      result,
      COLLECTION_MESSAGES.COLLECTIONS_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getActiveCollectionsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getActiveCollectionsService();

    returnSuccess(
      res,
      result,
      COLLECTION_MESSAGES.COLLECTIONS_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getCollectionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        COLLECTION_MESSAGES.COLLECTION_ID_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getCollectionByIdService(id);

    returnSuccess(
      res,
      result,
      COLLECTION_MESSAGES.COLLECTION_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getCollectionBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError(
        COLLECTION_MESSAGES.COLLECTION_SLUG_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getCollectionBySlugService(slug);

    returnSuccess(
      res,
      result,
      COLLECTION_MESSAGES.COLLECTION_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getCollectionsByTypeController = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.params as {
      type: "new" | "trending" | "sale" | "featured";
    };

    if (!type) {
      throw new AppError(
        COLLECTION_MESSAGES.COLLECTION_TYPE_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getCollectionsByTypeService(type);

    returnSuccess(
      res,
      result,
      COLLECTION_MESSAGES.COLLECTIONS_FOUND,
      StatusCode.SUCCESS
    );
  }
);
