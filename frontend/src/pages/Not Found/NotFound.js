/* ============================================================================
 * NOT FOUND PAGE
 * ============================================================================
 * Premium 404 page — liquid glass aesthetic, refined typography, clean CTAs.
 * ============================================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack } from 'react-icons/md';

import { GhostButton } from '../../components';
import styles from './NotFound.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * NOT FOUND PAGE
 * ============================================================================
 */
const NotFound = () => {
  // ========================================
  // HANDLERS
  // ========================================
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/');

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.root}>

      {/* Ambient background orbs */}
      <div className={styles.orbTopRight} aria-hidden="true" />
      <div className={styles.orbBottomLeft} aria-hidden="true" />

      {/* Main card */}
      <main className={styles.card}>

        {/* Status badge */}
        <div className={styles.statusBadge} aria-label="HTTP Error 404">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Error 404</span>
        </div>

        {/* 404 display */}
        <div className={styles.codeDisplay} aria-hidden="true">404</div>

        {/* Heading & description */}
        <h1 className={styles.heading}>Page Not Found</h1>
        <p className={styles.subtext}>
          The page you&rsquo;re looking for has gone missing &mdash; not unlike
          a semicolon in production code.
        </p>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Action buttons */}
        <div className={styles.actions}>
          <GhostButton onClick={handleGoHome}>
            <MdHome aria-hidden="true" />
            Go Home
          </GhostButton>
          <button type="button" onClick={handleGoBack}>
            <MdArrowBack aria-hidden="true" />
            Go Back
          </button>
        </div>

      </main>
    </div>
  );
};

export default NotFound;