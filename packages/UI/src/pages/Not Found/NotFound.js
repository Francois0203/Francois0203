import React from 'react';
import styles from './NotFound.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/GeneralWrappers.css';

import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const handleGoHome = () => {
    const base = '/';
    try {
      if (window && window.history && window.history.pushState) {
        window.history.pushState(null, '', base);
        window.location.reload();
        return;
      }
    } catch (e) {
      // ignore and fallback
    }
    window.location.href = base;
  };

  return (
    <div className={`${styles.viewport}`} role="main" aria-labelledby="notfound-title">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.gridOverlay} />
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      <div className={styles.content}>
        <div className={styles.glitchContainer}>
          <h1 id="notfound-title" className={styles.mainTitle}>
            <span className={styles.number}>4</span>
            <span className={`${styles.number} ${styles.middle}`}>0</span>
            <span className={styles.number}>4</span>
            <span className={styles.glitchLayer} aria-hidden="true">404</span>
          </h1>
        </div>

        <div className={styles.messageBox}>
          <div className={styles.scanline} aria-hidden="true" />
          <h2 className={styles.subtitle}>Page Not Found</h2>
          <p className={styles.description}>
            The page you're looking for has drifted into the digital void.
            It may have been moved, deleted, or never existed at all.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={handleGoHome} type="button">
            <Home size={20} />
            <span>Return Home</span>
          </button>
          <button className={styles.secondaryBtn} onClick={() => window.history.back()} type="button">
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        <div className={styles.floatingElements} aria-hidden="true">
          <div className={styles.cube} />
          <div className={`${styles.cube} ${styles.cube2}`} />
          <div className={`${styles.cube} ${styles.cube3}`} />
        </div>
      </div>
    </div>
  );
};

export default NotFound;