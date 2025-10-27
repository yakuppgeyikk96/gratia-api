import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { asyncHandler } from "../../../shared/middlewares";
import { StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { PRODUCT_MESSAGES } from "../constants/product.constants";
import {
  createProductService,
  getActiveProductsService,
  getAllProductsService,
  getProductByIdService,
  getProductBySlugService,
  getProductsByCategoryPathService,
  getProductsByCategoryService,
  getProductsByCollectionService,
} from "../services/product.services";
import CreateProductDto from "../types/CreateProductDto";

export const createProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateProductDto = req.body;

    const result = await createProductService(payload);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCT_CREATED,
      StatusCode.CREATED
    );
  }
);

export const getAllProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    const withDetails = req.query.details === "true";

    const result = await getAllProductsService(withDetails);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCTS_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getActiveProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    const withDetails = req.query.details === "true";

    const result = await getActiveProductsService(withDetails);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCTS_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getProductByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const withDetails = req.query.details === "true";

    if (!id) {
      throw new AppError(
        PRODUCT_MESSAGES.PRODUCT_ID_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getProductByIdService(id, withDetails);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCT_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getProductBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const withDetails = req.query.details === "true";

    if (!slug) {
      throw new AppError(
        PRODUCT_MESSAGES.PRODUCT_SLUG_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getProductBySlugService(slug, withDetails);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCT_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getProductsByCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    if (!categoryId) {
      throw new AppError(
        PRODUCT_MESSAGES.CATEGORY_ID_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getProductsByCategoryService(categoryId);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCTS_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getProductsByCollectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { collectionId } = req.params;

    if (!collectionId) {
      throw new AppError(
        PRODUCT_MESSAGES.COLLECTION_ID_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getProductsByCollectionService(collectionId);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCTS_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getProductsByCategoryPathController = asyncHandler(
  async (req: Request, res: Response) => {
    const { categorySlug } = req.params;

    if (!categorySlug) {
      throw new AppError(
        PRODUCT_MESSAGES.CATEGORY_SLUG_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getProductsByCategoryPathService(categorySlug);

    returnSuccess(
      res,
      result,
      PRODUCT_MESSAGES.PRODUCTS_FOUND,
      StatusCode.SUCCESS
    );
  }
);
