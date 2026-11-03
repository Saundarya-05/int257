export class AppError extends Error {
  constructor(message, statusCode = 500, code = "SERVER_ERROR", details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input", details) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}
