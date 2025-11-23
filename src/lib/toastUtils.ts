/**
 * Toast notification utilities using Sonner
 * Provides centralized toast notification functions with consistent styling
 */
import { toast as sonnerToast } from 'sonner';
import { getUserErrorMessage } from '../types/errors';

/**
 * Success toast notification
 */
export function showSuccess(message: string) {
  sonnerToast.success(message);
}

/**
 * Error toast notification
 * Automatically extracts user-friendly messages from AppErrors
 */
export function showError(error: unknown, fallbackMessage?: string) {
  const message = getUserErrorMessage(error);
  sonnerToast.error(fallbackMessage || message);
}

/**
 * Info toast notification
 */
export function showInfo(message: string) {
  sonnerToast.info(message);
}

/**
 * Warning toast notification
 */
export function showWarning(message: string) {
  sonnerToast.warning(message);
}

/**
 * Loading toast notification
 * Returns a promise that resolves when the promise completes
 */
export async function showLoading<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  }
): Promise<T> {
  sonnerToast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: (error: unknown) => {
      if (typeof options.error === 'function') {
        return options.error(error);
      }
      return options.error || getUserErrorMessage(error);
    }
  });
  return promise;
}

/**
 * Custom toast notification
 */
export function showToast(message: string) {
  sonnerToast(message);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  sonnerToast.dismiss();
}

// Re-export for convenience
export { sonnerToast as toast };
