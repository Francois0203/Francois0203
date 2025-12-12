import React from 'react';
import { AlertTriangle, Home as HomeIcon, RotateCcw } from 'lucide-react';

import styles from './ErrorBoundary.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/GeneralWrappers.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call optional error logging callback
    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        console.error('Error in onError callback:', e);
      }
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });

    // Call optional reset callback
    if (typeof this.props.onReset === 'function') {
      try {
        this.props.onReset();
      } catch (e) {
        console.error('Error in onReset callback:', e);
      }
    }
  };

  handleGoHome = () => {
    // Priority 1: Custom navigation handler
    if (typeof this.props.onGoHome === 'function') {
      try {
        this.props.onGoHome();
        return;
      } catch (e) {
        console.error('Error in onGoHome callback:', e);
      }
    }

    // Priority 2: React Router navigate function
    if (typeof this.props.navigate === 'function') {
      try {
        this.props.navigate(this.props.fallbackPath || '/');
        return;
      } catch (e) {
        console.error('Error using navigate function:', e);
      }
    }

    // Priority 3: Next.js router
    if (this.props.router && typeof this.props.router.push === 'function') {
      try {
        this.props.router.push(this.props.fallbackPath || '/');
        return;
      } catch (e) {
        console.error('Error using Next.js router:', e);
      }
    }

    // Priority 4: History API (for client-side routing)
    const fallbackPath = this.props.fallbackPath || '/';
    try {
      if (window?.history?.pushState) {
        window.history.pushState(null, '', fallbackPath);
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
        return;
      }
    } catch (e) {
      console.error('Error using History API:', e);
    }

    // Final fallback: Full page reload
    window.location.href = fallbackPath;
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { 
        title = 'Something went wrong',
        message = 'An unexpected error occurred while loading this part of the application. You can try again or return to the dashboard.',
        showErrorDetails = process.env.NODE_ENV !== 'production',
        resetButtonText = 'Try again',
        homeButtonText = 'Go home',
        showResetButton = true,
        showHomeButton = true,
        customUI
      } = this.props;

      // Allow consumers to provide completely custom error UI
      if (customUI) {
        return customUI({
          error,
          errorInfo,
          resetError: this.handleReset,
          goHome: this.handleGoHome
        });
      }

      return (
        <div className={styles.container} role="alert" aria-live="assertive">
          <div className={styles.card}>
            <div className={styles.header}>
              <AlertTriangle className={styles.icon} aria-hidden="true" />
              <h1 className={styles.title}>{title}</h1>
            </div>
            
            <p className={styles.description}>{message}</p>

            <div className={styles.actions}>
              {showResetButton && (
                <button 
                  className={styles.primary}
                  onClick={this.handleReset}
                  type="button"
                  aria-label="Try again"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  <span>{resetButtonText}</span>
                </button>
              )}
              
              {showHomeButton && (
                <button 
                  onClick={this.handleGoHome}
                  type="button"
                  aria-label="Go to home page"
                >
                  <HomeIcon size={16} aria-hidden="true" />
                  <span>{homeButtonText}</span>
                </button>
              )}
            </div>

            {showErrorDetails && error && (
              <details>
                <summary>Show error details</summary>
                <pre className={styles.pre}>
                  {error.toString()}
                  {errorInfo?.componentStack && `\n${errorInfo.componentStack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.defaultProps = {
  fallbackPath: '/',
  showResetButton: true,
  showHomeButton: true
};

export default ErrorBoundary;