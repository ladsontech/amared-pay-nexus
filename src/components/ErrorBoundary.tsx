import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-x-2">
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Clear localStorage and redirect to login
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                Clear & Login
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

