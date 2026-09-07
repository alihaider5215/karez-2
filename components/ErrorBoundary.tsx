'use client';
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackLabel?: string },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center 
                        min-h-[200px] bg-gray-900 border border-red-800/40 
                        rounded-xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
          <h3 className="text-white font-semibold mb-1">
            {this.props.fallbackLabel || 'Something went wrong'}
          </h3>
          <p className="text-gray-400 text-sm mb-4 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred in this panel.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 
                       text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
