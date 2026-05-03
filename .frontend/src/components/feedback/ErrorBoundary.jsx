import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      errorStack: '',
      componentStack: ''
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message ? String(error.message) : String(error),
      errorStack: error?.stack ? String(error.stack) : ''
    };
  }

  componentDidCatch(error, errorInfo) {
    // Single catch-point for unexpected render-time failures.
    console.error('Application render error', error, errorInfo?.componentStack);
    this.setState({
      componentStack: errorInfo?.componentStack ? String(errorInfo.componentStack) : ''
    });
  }

  render() {
    if (this.state.hasError) {
      const showDetails = import.meta.env.DEV;
      return (
        <Container className="py-20">
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-soft">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink-950">
              Something broke a sweat.
            </h1>
            <p className="mt-3 text-sm text-ink-500">
              Our team has been notified. Please refresh the page or try again shortly.
            </p>
            {showDetails && this.state.errorMessage ? (
              <details className="mt-6 w-full max-w-full text-left">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-ink-600">
                  Development error details
                </summary>
                <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-ink-950 p-4 text-left text-2xs leading-relaxed text-emerald-100">
                  {this.state.errorMessage}
                  {this.state.errorStack ? `\n\n${this.state.errorStack}` : ''}
                  {this.state.componentStack ? `\n\nComponent stack:${this.state.componentStack}` : ''}
                </pre>
              </details>
            ) : null}
            <Button
              variant="primary"
              size="lg"
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </Button>
          </div>
        </Container>
      );
    }
    return this.props.children;
  }
}
