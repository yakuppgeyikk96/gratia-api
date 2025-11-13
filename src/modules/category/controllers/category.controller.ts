import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { asyncHandler } from "../../../shared/middlewares";
import { StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { CATEGORY_MESSAGES } from "../constants/category.constants";
import {
  createCategoryService,
  getActiveCategoriesService,
  getAllCategoriesService,
  getCategoryByIdService,
  getCategoryBySlugService,
  getCategoryTreeService,
  getSubCategoriesService,
} from "../services/category.services";
import { CategoryTreeNode, CreateCategoryDto } from "../types";

export const createCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload: CreateCategoryDto = req.body;

    const result = await createCategoryService(payload);

    returnSuccess(
      res,
      result,
      CATEGORY_MESSAGES.CATEGORY_CREATED,
      StatusCode.CREATED
    );
  }
);

export const getAllCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getAllCategoriesService();

    returnSuccess(
      res,
      result,
      CATEGORY_MESSAGES.CATEGORIES_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getActiveCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getActiveCategoriesService();

    returnSuccess(
      res,
      result,
      CATEGORY_MESSAGES.CATEGORIES_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getCategoryByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(
        CATEGORY_MESSAGES.CATEGORY_ID_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getCategoryByIdService(id);

    returnSuccess(
      res,
      result,
      CATEGORY_MESSAGES.CATEGORY_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getCategoryBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    if (!slug) {
      throw new AppError(
        CATEGORY_MESSAGES.CATEGORY_SLUG_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getCategoryBySlugService(slug);

    returnSuccess(
      res,
      result,
      CATEGORY_MESSAGES.CATEGORY_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getSubCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { parentId } = req.params;

    if (!parentId) {
      throw new AppError(
        CATEGORY_MESSAGES.PARENT_CATEGORY_ID_REQUIRED,
        ErrorCode.BAD_REQUEST
      );
    }

    const result = await getSubCategoriesService(parentId);

    returnSuccess(
      res,
      result,
      CATEGORY_MESSAGES.CATEGORIES_FOUND,
      StatusCode.SUCCESS
    );
  }
);

export const getCategoryTreeController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getCategoryTreeService();

    returnSuccess<CategoryTreeNode[]>(
      res,
      result,
      CATEGORY_MESSAGES.CATEGORIES_FOUND,
      StatusCode.SUCCESS
    );
  }
);
