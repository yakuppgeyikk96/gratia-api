import { Request, Response } from "express";
import { AppError, ErrorCode } from "../../../shared/errors/base.errors";
import { asyncHandler } from "../../../shared/middlewares";
import { StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { PRODUCT_MESSAGES } from "../constants/product.constants";
import {
  createProductService,
  getProductByIdService,
  getProductsService,
} from "../services/product.services";
import CreateProductDto from "../types/CreateProductDto";
import { SortOptions } from "../types/ProductQueryOptionsDto";

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

export const getProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { categorySlug, collectionSlug, sort, page, limit } = req.query;
    const withDetails = req.query.details === "true";

    const filters: any = {};

    /**
     * If the color filter is present, add it to the filters object
     */
    if (req.query["filters[color]"]) {
      filters.colors = Array.isArray(req.query["filters[color]"])
        ? req.query["filters[color]"]
        : [req.query["filters[color]"]];
    }

    /**
     * If the size filter is present, add it to the filters object
     */
    if (req.query["filters[size]"]) {
      filters.sizes = Array.isArray(req.query["filters[size]"])
        ? req.query["filters[size]"]
        : [req.query["filters[size]"]];
    }

    /**
     * If the brand filter is present, add it to the filters object
     */
    if (req.query["filters[brand]"]) {
      filters.brands = Array.isArray(req.query["filters[brand]"])
        ? req.query["filters[brand]"]
        : [req.query["filters[brand]"]];
    }

    /**
     * If the min price filter is present, add it to the filters object
     */
    if (req.query["filters[minPrice]"]) {
      filters.minPrice = Number(req.query["filters[minPrice]"]);
    }

    /**
     * If the max price filter is present, add it to the filters object
     */
    if (req.query["filters[maxPrice]"]) {
      filters.maxPrice = Number(req.query["filters[maxPrice]"]);
    }

    /**
     * If the material filter is present, add it to the filters object
     */
    if (req.query["filters[material]"]) {
      filters.materials = Array.isArray(req.query["filters[material]"])
        ? req.query["filters[material]"]
        : [req.query["filters[material]"]];
    }

    /**
     * Get the products
     */
    const result = await getProductsService(
      {
        categorySlug: categorySlug as string,
        collectionSlug: collectionSlug as string,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: (sort as unknown as SortOptions) || "newest",
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
      withDetails
    );

    returnSuccess(res, result, PRODUCT_MESSAGES.PRODUCTS_FOUND);
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
