/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message, { cause: options.cause });

    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database-related errors
 */
class DatabaseError extends AppError {
  constructor(message = "Database operation failed", cause = null) {
    super(message, 500, { cause });
  }
}

/**
 * Resource not found
 */
class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Client validation errors
 */
class ValidationError extends AppError {
  constructor(message = "Invalid input") {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError,
};
