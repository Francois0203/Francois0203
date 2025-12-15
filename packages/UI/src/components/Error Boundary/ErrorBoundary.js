import React from "react";
import styles from "./ErrorBoundary.module.css";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              An unexpected error occurred. Please try reloading the page.
            </p>

            <div className={styles.actions}>
              <button onClick={this.handleReload} className={styles.primary}>
                Reload page
              </button>
            </div>

            {this.state.error && (
              <details className={styles.details}>
                <summary>Technical details</summary>
                <pre className={styles.pre}>
                  {this.state.error.toString()}
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