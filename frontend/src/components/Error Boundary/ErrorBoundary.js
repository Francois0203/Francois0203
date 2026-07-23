import React from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * App-level error boundary.
 *
 * Drop-in - no required props:
 *   <ErrorBoundary>{children}</ErrorBoundary>
 *
 * Optional props:
 *   resetKey  - when this value changes, the boundary auto-clears (pass the
 *               route path so navigating away recovers automatically).
 *   onError   - (error, info) callback for logging / reporting.
 *
 * Recovery offered to the user, cheapest first:
 *   • Try again - re-render the children in place (no reload).
 *   • Reload    - full page reload.
 *   • Go home   - navigate to "/".
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset  = () => this.setState({ hasError: false, error: null, errorInfo: null });
  reload = () => window.location.reload();
  goHome = () => window.location.assign('/');

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, errorInfo } = this.state;

    return (
      <div className={styles.root} role="alert">
        <div className={styles.card}>
          <div className={styles.iconWrap} aria-hidden="true">
            <span className={styles.iconText}>!</span>
          </div>

          <div className={styles.message}>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.subtitle}>
              An unexpected error interrupted the page. Try again first - if it
              keeps happening, reload or head back home.
            </p>
          </div>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={this.reset}>
              Try again
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={this.reload}>
              Reload
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={this.goHome}>
              Go home
            </button>
          </div>

          {error && (
            <details className={styles.details}>
              <summary className={styles.detailsSummary}>Technical details</summary>
              <div className={styles.detailsBody}>
                <pre className={styles.pre}>{error.toString()}</pre>
                {errorInfo?.componentStack && (
                  <pre className={styles.pre}>{errorInfo.componentStack}</pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
