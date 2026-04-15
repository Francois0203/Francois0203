import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './ErrorBoundary.module.css';

// ─── ERROR BOUNDARY INNER ─────────────────────────────────────────────────────────
// Class component — required by React's error boundary API.
// Catches render, lifecycle, and constructor errors in the subtree.

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError:    false,
      error:       null,
      errorInfo:   null,
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
    if (onReset) onReset();
    else window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { theme } = this.props;

      return (
        <div className={styles.errorContainer} data-theme={theme}>
          {/* Animated background particles */}
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

          {/* Ambient glow orbs */}
          <div className={styles.backgroundEffects}>
            <div className={styles.glowOrb1} />
            <div className={styles.glowOrb2} />
          </div>

          {/* Main content — scrollable */}
          <div className={styles.contentScroll}>
            <div className={styles.contentWrapper}>

              {/* Alert icon */}
              <div className={styles.iconContainer}>
                <div className={styles.alertCircle}>
                  <div className={styles.alertIcon}>!</div>
                </div>
                <div className={styles.pulseRing} />
              </div>

              {/* Error message */}
              <div className={styles.messageContainer}>
                <h1 className={styles.title}>Something Went Wrong</h1>
                <p className={styles.subtitle}>
                  An unexpected error occurred. Try reloading or going home.
                </p>
              </div>

              {/* Recovery actions */}
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

              {/* Collapsible technical details */}
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

          {/* Corner decorations */}
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

// ─── WRAPPER ────────────────────────────────────────────────────────────────
// Provides theme context to the class component (hooks can't run inside classes).
const ErrorBoundary = (props) => {
  const { theme } = useTheme();
  return <ErrorBoundaryInner {...props} theme={theme} />;
};

export default ErrorBoundary;