import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { returnError, validationError } from "../utils/response.utils";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        validationError(res, errors);
        return;
      }
      returnError(res, "Validation failed", 400);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query) as any;
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        validationError(res, errors);
        return;
      }
      returnError(res, "Validation failed", 400);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params) as any;
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        validationError(res, errors);
        return;
      }
      returnError(res, "Validation failed", 400);
    }
  };
};
