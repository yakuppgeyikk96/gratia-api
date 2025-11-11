import { Response } from "express";
import { asyncHandler } from "../../../shared/middlewares";
import { AuthRequest, StatusCode } from "../../../shared/types";
import { returnSuccess } from "../../../shared/utils/response.utils";
import { CART_MESSAGES } from "../constants/cart.constants";
import {
  addToCartService,
  clearCartService,
  getCartService,
  removeFromCartService,
  syncCartService,
  updateCartItemService,
} from "../services/cart.services";
import { AddToCartDto, SyncCartDto, UpdateCartItemDto } from "../types";

export const getCartController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const cart = await getCartService(userId);

    returnSuccess(res, cart, CART_MESSAGES.CART_RETRIEVED, StatusCode.SUCCESS);
  }
);

export const addToCartController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const payload: AddToCartDto = req.body;

    const cart = await addToCartService(userId, payload);

    returnSuccess(res, cart, CART_MESSAGES.ITEM_ADDED, StatusCode.SUCCESS);
  }
);

export const updateCartItemController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const payload: UpdateCartItemDto = req.body;

    const cart = await updateCartItemService(userId, payload);

    returnSuccess(res, cart, CART_MESSAGES.ITEM_UPDATED, StatusCode.SUCCESS);
  }
);

export const removeFromCartController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { sku } = req.params;

    const cart = await removeFromCartService(userId, sku!);

    returnSuccess(res, cart, CART_MESSAGES.ITEM_REMOVED, StatusCode.SUCCESS);
  }
);

export const clearCartController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const cart = await clearCartService(userId);

    returnSuccess(res, cart, CART_MESSAGES.CART_CLEARED, StatusCode.SUCCESS);
  }
);

export const syncCartController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const payload: SyncCartDto = req.body;

    const cart = await syncCartService(userId, payload);

    returnSuccess(res, cart, CART_MESSAGES.CART_SYNCED, StatusCode.SUCCESS);
  }
);
