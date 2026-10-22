"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/fields/Button";
import { ErrorState } from "./ErrorState";

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Called with the caught error and React's component stack. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** When any value changes the boundary clears its error state. */
  resetKeys?: readonly unknown[];
};

type ErrorBoundaryState = {
  error: Error | null;
};

function haveResetKeysChanged(previous: readonly unknown[] = [], next: readonly unknown[] = []) {
  return previous.length !== next.length || previous.some((value, index) => !Object.is(value, next[index]));
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (this.state.error && haveResetKeysChanged(previousProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    if (typeof fallback === "function") {
      return fallback(error, this.reset);
    }

    if (fallback) {
      return fallback;
    }

    return (
      <ErrorState
        actions={
          <Button variant="secondary" onClick={this.reset}>
            Try again
          </Button>
        }
        description={error.message || undefined}
        status="error"
      />
    );
  }
}
