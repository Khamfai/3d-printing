import type { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/error-handler";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formatted = formatZodError(result.error);
    throw new ValidationError("Validation failed", formatted);
  }
  return result.data;
}

function formatZodError(error: ZodError): string {
  return error.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
}
