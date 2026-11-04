import React from 'react';
import Button from '../Button';
import { copyOf } from '../../content/copy/store';
import styles from './ErrorBoundary.module.css';

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
    const t = copyOf('site');

    return (
      <div className={styles.root} role="alert">
        <div className={`glass ${styles.inner}`} data-tone="red">
          <span className={styles.mark} aria-hidden="true">!</span>

          <h1 className={styles.title}>{t.errorTitle}</h1>

          <p className={styles.text}>{t.errorText}</p>

          <div className={styles.actions}>
            <Button variant="primary" onClick={this.reset}>{t.errorRetry}</Button>
            <Button variant="glass" onClick={this.reload}>{t.errorReload}</Button>
            <Button variant="ghost" onClick={this.goHome}>{t.errorHome}</Button>
          </div>

          {error && (
            <details className={styles.details}>
              <summary>{t.errorDetails}</summary>
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
