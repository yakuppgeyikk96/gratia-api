import { Request } from "express";

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  errorCode?: string;
  timestamp?: string;
}

export interface IApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  errorCode?: string;
  timestamp?: string;
}

export interface IApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  timestamp?: string;
}

export enum StatusCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
