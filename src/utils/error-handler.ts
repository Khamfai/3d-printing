import { Elysia } from "elysia";
import { error } from "./response";

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
  ({ code, error: err, set }) => {
    if (err instanceof AppError) {
      set.status = err.statusCode as 200;
      return error(err.message, err.detail);
    }

    switch (code) {
      case "VALIDATION":
        set.status = 422;
        return error("Validation failed", err.message);
      case "NOT_FOUND":
        set.status = 404;
        return error("Route not found");
      case "PARSE":
        set.status = 400;
        return error("Invalid request body");
      default:
        console.error("Unhandled error:", err);
        set.status = 500;
        return error(
          "Internal server error",
          process.env.NODE_ENV === "development" ? String(err) : undefined
        );
    }
  }
);
