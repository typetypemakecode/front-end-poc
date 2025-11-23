/**
 * Custom Error Types for Application
 * Provides structured error handling with meaningful error categories
 */

/**
 * Base class for all application errors
 */
export class AppError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }

  /**
   * Returns a user-friendly error message
   */
  getUserMessage(): string {
    return this.message;
  }
}

/**
 * Network-related errors (fetch failures, timeouts, connectivity issues)
 */
export class NetworkError extends AppError {
  public readonly originalError?: Error;

  constructor(
    message: string,
    originalError?: Error,
    code?: string
  ) {
    super(message, code, 0);
    this.originalError = originalError;
  }

  getUserMessage(): string {
    if (this.code === 'TIMEOUT') {
      return 'The request took too long to complete. Please check your internet connection and try again.';
    }
    if (this.code === 'OFFLINE') {
      return 'You appear to be offline. Please check your internet connection.';
    }
    return 'A network error occurred. Please check your connection and try again.';
  }
}

/**
 * API/HTTP errors with status codes
 */
export class ApiError extends AppError {
  public readonly response?: Response;

  constructor(
    message: string,
    statusCode: number,
    response?: Response,
    code?: string
  ) {
    super(message, code, statusCode);
    this.response = response;
  }

  getUserMessage(): string {
    switch (this.statusCode) {
      case 400:
        return 'The request was invalid. Please check your input and try again.';
      case 401:
        return 'You are not authorized to perform this action. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This operation conflicts with existing data. Please refresh and try again.';
      case 422:
        return this.message || 'The data provided was invalid. Please check and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'A server error occurred. Please try again later.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred. Please try again.';
    }
  }
}

/**
 * Validation errors (invalid input, schema validation failures)
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationErrors?: Record<string, string[]>;

  constructor(
    message: string,
    field?: string,
    validationErrors?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 422);
    this.field = field;
    this.validationErrors = validationErrors;
  }

  getUserMessage(): string {
    if (this.field) {
      return `Invalid ${this.field}: ${this.message}`;
    }
    return this.message || 'The data provided was invalid. Please check your input.';
  }
}

/**
 * Storage errors (localStorage, sessionStorage failures)
 */
export class StorageError extends AppError {
  public readonly storageType: 'localStorage' | 'sessionStorage';
  public readonly operation?: 'read' | 'write' | 'delete';

  constructor(
    message: string,
    storageType: 'localStorage' | 'sessionStorage' = 'localStorage',
    operation?: 'read' | 'write' | 'delete'
  ) {
    super(message, 'STORAGE_ERROR');
    this.storageType = storageType;
    this.operation = operation;
  }

  getUserMessage(): string {
    if (this.operation === 'write') {
      return 'Failed to save data locally. Your storage may be full or disabled.';
    }
    if (this.operation === 'read') {
      return 'Failed to load local data. Your browser storage may be corrupted.';
    }
    return 'A storage error occurred. Please check your browser settings.';
  }
}

/**
 * Data parsing/deserialization errors
 */
export class DataError extends AppError {
  public readonly data?: unknown;

  constructor(
    message: string,
    data?: unknown
  ) {
    super(message, 'DATA_ERROR');
    this.data = data;
  }

  getUserMessage(): string {
    return 'The data received was invalid or corrupted. Please try refreshing the page.';
  }
}

/**
 * Not found errors (task not found, list not found, etc.)
 */
export class NotFoundError extends AppError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string
  ) {
    super(message, 'NOT_FOUND', 404);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  getUserMessage(): string {
    if (this.resourceType) {
      return `The ${this.resourceType} was not found. It may have been deleted.`;
    }
    return 'The requested item was not found.';
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Converts any error to an AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Failed to connect to the server', error as Error);
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError('An unexpected error occurred');
}

/**
 * Gets a user-friendly error message from any error
 */
export function getUserErrorMessage(error: unknown): string {
  const appError = toAppError(error);
  return appError.getUserMessage();
}
