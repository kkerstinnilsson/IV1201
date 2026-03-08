import React from "react";

/**
 * Catches unexpected runtime errors in the React component tree and renders
 * a fallback UI instead of crashing the entire application.
 *
 * Does NOT handle API/async errors, handleApiError is used for those.
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? <p>Something went wrong. Please refresh the page.</p>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;