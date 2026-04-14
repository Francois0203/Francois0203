import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './ErrorBoundary.module.css';

/* ============================================================================
 * ERROR BOUNDARY COMPONENT
 * ============================================================================
 * Catches JavaScript errors anywhere in the child component tree.
 * Features animated background, error details, and recovery options.
 *
 * Props:
 *   onReset   optional callback invoked by "Reload Page", overriding the
 *             default window.location.reload(). Useful for demo/test contexts.
 * ============================================================================
 */

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      detailsOpen: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  handleReload = () => {
    const { onReset } = this.props;
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { theme } = this.props;

      return (
        <div className={styles.errorContainer} data-theme={theme}>
          {/* Background — Animated particles */}
          <div className={styles.particlesContainer}>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={styles.particle}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          {/* Glowing orbs */}
          <div className={styles.backgroundEffects}>
            <div className={styles.glowOrb1} />
            <div className={styles.glowOrb2} />
          </div>

          {/* Main Content — Scrollable wrapper */}
          <div className={styles.contentScroll}>
            <div className={styles.contentWrapper}>

              {/* Error Icon */}
              <div className={styles.iconContainer}>
                <div className={styles.alertCircle}>
                  <div className={styles.alertIcon}>!</div>
                </div>
                <div className={styles.pulseRing} />
              </div>

              {/* Error Message */}
              <div className={styles.messageContainer}>
                <h1 className={styles.title}>Something Went Wrong</h1>
                <p className={styles.subtitle}>
                  An unexpected error occurred. Try reloading or going home.
                </p>
              </div>

              {/* Action Buttons */}
              <div className={styles.actionsContainer}>
                <button onClick={this.handleGoHome}>
                  ← Go Home
                </button>
                <button
                  type="button"
                  onClick={this.handleReload}
                >
                  ↻ Reload Page
                </button>
              </div>

              {/* Technical Details — Collapsible */}
              {this.state.error && (
                <div className={styles.technicalDetails}>
                  <button
                    type="button"
                    className={styles.detailsSummary}
                    onClick={() => this.setState(s => ({ detailsOpen: !s.detailsOpen }))}
                    aria-expanded={this.state.detailsOpen}
                  >
                    <span className={`${styles.detailsChevron} ${this.state.detailsOpen ? styles.detailsChevronOpen : ''}`}>▶</span>
                    View Technical Details
                  </button>
                  {this.state.detailsOpen && (
                    <div className={styles.detailsContent}>
                      <div className={styles.errorBlock}>
                        <h3 className={styles.errorBlockTitle}>Error Message:</h3>
                        <pre className={styles.errorText}>
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div className={styles.errorBlock}>
                          <h3 className={styles.errorBlockTitle}>Component Stack:</h3>
                          <pre className={styles.errorText}>
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Corner Decorations */}
          <div className={styles.cornerDeco} style={{ top: '20px', left: '20px' }}>✦</div>
          <div className={styles.cornerDeco} style={{ top: '20px', right: '20px' }}>✦</div>
          <div className={styles.cornerDeco} style={{ bottom: '20px', left: '20px' }}>✦</div>
          <div className={styles.cornerDeco} style={{ bottom: '20px', right: '20px' }}>✦</div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ============================================================================
 * WRAPPER COMPONENT — Provides theme context to the class component
 * ============================================================================
 */
const ErrorBoundary = (props) => {
  const { theme } = useTheme();
  return <ErrorBoundaryInner {...props} theme={theme} />;
};

export default ErrorBoundary;