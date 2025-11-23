/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { showError } from '../lib/toastUtils';
import { toAppError } from '../types/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showToast?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Show toast notification if enabled
    if (this.props.showToast !== false) {
      const appError = toAppError(error);
      showError(appError, 'An unexpected error occurred');
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="max-w-md">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-accent text-background rounded-md hover:bg-accent/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Feature-specific error boundary with minimal UI
 * Use this for smaller sections like Sidebar, TaskList, etc.
 */
export function FeatureErrorBoundary({
  children,
  featureName
}: {
  children: ReactNode;
  featureName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
          <p className="text-sm">
            Failed to load {featureName}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Reload page
          </button>
        </div>
      }
      showToast={true}
    >
      {children}
    </ErrorBoundary>
  );
}
