import React from 'react';
import styles from './ErrorBoundary.module.css';

/*
 * Catches a render error in the tree below it and shows a way out rather
 * than a blank page. Keyed on the route, so an error on one page does not
 * leave the app broken after navigating away.
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
        <div className={styles.inner}>
          <p className={styles.mark}>Error</p>

          <h1 className={styles.title}>That did not go to plan</h1>

          <p className={styles.text}>
            Something in the page failed while it was rendering. Try again
            first. If it keeps happening, reload, or head back to the start.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={this.reset}>
              Try again
            </button>
            <button type="button" className={styles.ghost} onClick={this.reload}>
              Reload
            </button>
            <button type="button" className={styles.ghost} onClick={this.goHome}>
              Back to the start
            </button>
          </div>

          {error && (
            <details className={styles.details}>
              <summary>Technical details</summary>
              <pre>{error.toString()}</pre>
              {errorInfo?.componentStack && <pre>{errorInfo.componentStack}</pre>}
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
