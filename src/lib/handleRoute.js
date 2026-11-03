import { ZodError } from "zod";
import { connectDB } from "@/lib/db";
import { AppError, ValidationError } from "@/lib/errors";
import { failure } from "@/lib/apiResponse";

export function handleRoute(handler) {
  return async (request, context) => {
    try {
      await connectDB();
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return failure("VALIDATION_ERROR", "Invalid input", 400, details);
      }
      if (error instanceof AppError) {
        return failure(error.code, error.message, error.statusCode, error.details);
      }
      if (error?.code === 11000) {
        return failure("DUPLICATE", "This record already exists", 409);
      }
      console.error(error);
      return failure("SERVER_ERROR", "Something went wrong on the server", 500);
    }
  };
}

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
}
