import { Elysia } from "elysia";
import { error } from "./response";
import { logger } from "../lib/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public detail?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", detail?: string) {
    super(422, message, detail);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(409, message);
  }
}

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  { as: "global" },
  ({ code, error: err, set }) => {
    if (err instanceof AppError) {
      logger.warn({ statusCode: err.statusCode, detail: err.detail }, err.message);
      set.status = err.statusCode as 200;
      return error(err.message, err.detail);
    }

    // Fallback: check by property in case instanceof fails across module boundaries
    const maybeAppError = err as unknown as AppError;
    if (typeof maybeAppError.statusCode === "number" && maybeAppError.statusCode >= 400) {
      logger.warn(
        { statusCode: maybeAppError.statusCode, detail: maybeAppError.detail },
        maybeAppError.message
      );
      set.status = maybeAppError.statusCode as 200;
      return error(maybeAppError.message, maybeAppError.detail);
    }

    switch (code) {
      case "VALIDATION":
        logger.warn({ code }, err.message);
        set.status = 422;
        return error("Validation failed", err.message);
      case "NOT_FOUND":
        set.status = 404;
        return error("Route not found");
      case "PARSE":
        logger.warn({ code }, "Invalid request body");
        set.status = 400;
        return error("Invalid request body");
      default:
        logger.error({ err, code }, "Unhandled error");
        set.status = 500;
        return error(
          "Internal server error",
          process.env.NODE_ENV === "development" ? String(err) : undefined
        );
    }
  }
);
