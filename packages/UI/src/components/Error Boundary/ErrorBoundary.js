import React from 'react';
import { useTheme } from '../../hooks/useTheme';

/* Styling */
import styles from './ErrorBoundary.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
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
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          {/* Glowing orbs */}
          <div className={styles.backgroundEffects}>
            <div className={styles.glowOrb1}></div>
            <div className={styles.glowOrb2}></div>
          </div>

          {/* Main content (wrapped to allow scrolling on small viewports) */}
          <div className={styles.contentScroll}>
            <div className={styles.contentWrapper}>
            {/* Error icon with animation */}
            <div className={styles.iconContainer}>
              <div className={styles.alertCircle}>
                <div className={styles.alertIcon}>!</div>
              </div>
              <div className={styles.pulseRing}></div>
            </div>

            {/* Error message */}
            <div className={styles.messageContainer}>
              <h1 className={styles.title}>Something Went Wrong</h1>
              <p className={styles.subtitle}>
                An unexpected error occurred. Try reloading or going home.
              </p>
            </div>

            {/* Action buttons */}
            <div className={styles.actionsContainer}>
              <button 
                onClick={this.handleReload} 
                className={`${styles.button} ${styles.primaryButton}`}
              >
                <span className={styles.buttonIcon}>↻</span>
                Reload Page
              </button>
              <button 
                onClick={this.handleGoHome} 
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                <span className={styles.buttonIcon}>←</span>
                Go Home
              </button>
            </div>

            {/* Technical details collapsible */}
            {this.state.error && (
              <details className={styles.technicalDetails}>
                <summary className={styles.detailsSummary}>
                  View Technical Details
                </summary>
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
              </details>
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

// Wrapper to provide theme
const ErrorBoundary = (props) => {
  const { theme } = useTheme();
  return <ErrorBoundaryInner {...props} theme={theme} />;
};

export default ErrorBoundary;