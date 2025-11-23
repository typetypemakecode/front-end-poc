/**
 * Retry utilities with exponential backoff
 * Provides intelligent retry logic for network requests
 */

import { NetworkError, ApiError } from '../types/errors';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  shouldRetry: (error: Error) => {
    // Retry network errors
    if (error instanceof NetworkError) {
      return true;
    }

    // Retry specific HTTP status codes
    if (error instanceof ApiError) {
      const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
      return retryableStatusCodes.includes(error.statusCode || 0);
    }

    // Retry fetch network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }

    return false;
  },
  onRetry: (error: Error, attempt: number, delay: number) => {
    console.warn(`Retry attempt ${attempt} after ${delay}ms due to error:`, error.message);
  }
};

/**
 * Delays execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffFactor, attempt - 1);
  // Add jitter (randomization) to prevent thundering herd
  const jitter = Math.random() * 0.3 * exponentialDelay;
  const totalDelay = Math.min(exponentialDelay + jitter, maxDelay);
  return Math.floor(totalDelay);
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (!opts.shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay for this attempt
      const delayMs = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffFactor
      );

      // Notify about retry
      opts.onRetry(lastError, attempt, delayMs);

      // Wait before retrying
      await delay(delayMs);
    }
  }

  // All attempts failed
  throw lastError!;
}

/**
 * Creates a fetch wrapper with retry logic
 */
export function createRetryingFetch(options: RetryOptions = {}) {
  return async function retryingFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    return retryWithBackoff(async () => {
      const response = await fetch(input, init);

      // Throw ApiError for non-OK responses
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        );
      }

      return response;
    }, options);
  };
}

/**
 * Checks if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Waits for the browser to come back online
 */
export function waitForOnline(timeoutMs: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      cleanup();
      reject(new NetworkError('Still offline after timeout', undefined, 'OFFLINE'));
    }, timeoutMs);

    const handleOnline = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
    };

    window.addEventListener('online', handleOnline);
  });
}
