/* ============================================================================
 * NOT FOUND PAGE - FUN & INTERACTIVE
 * ============================================================================
 * Creative 404 page with animations and Easter eggs
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack, MdSearch, MdSentimentDissatisfied } from 'react-icons/md';

/* Styling */
import styles from './NotFound.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * NOT FOUND PAGE
 * ============================================================================
 */
const NotFound = () => {
  // ========================================
  // STATE
  // ========================================
  const [glitchActive, setGlitchActive] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const navigate = useNavigate();

  // ========================================
  // DATA - Memoized to prevent dependency issues
  // ========================================
  const messages = React.useMemo(() => [
    "Oops! This page went on vacation 🏖️",
    "404: Page is playing hide and seek 🙈",
    "Houston, we have a problem... 🚀",
    "This page took a wrong turn 🗺️",
    "Lost in cyberspace... 🌌",
    "Error 404: Page not found (but you found this!) ✨",
    "This page is in another castle 🏰",
    "Nothing to see here... move along 👀",
  ], []);

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    // Random message on load
    setMessageIndex(Math.floor(Math.random() * messages.length));

    // Glitch effect interval
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);

    return () => clearInterval(glitchInterval);
  }, [messages]);

  // ========================================
  // HANDLERS
  // ========================================
  const handle404Click = () => {
    setEasterEggCount(prev => prev + 1);
    setMessageIndex((prev) => (prev + 1) % messages.length);
    
    if (easterEggCount + 1 === 5) {
      setShowSecret(true);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
        <div className={styles.star}></div>
      </div>

      {/* Main Content Card */}
      <div className={styles.card}>
        {/* 404 Number */}
        <div 
          className={`${styles.errorCode} ${glitchActive ? styles.glitch : ''}`}
          onClick={handle404Click}
        >
          <span className={styles.digit}>4</span>
          <span className={styles.digit}>0</span>
          <span className={styles.digit}>4</span>
        </div>

        {/* Icon */}
        <div className={styles.iconWrapper}>
          <MdSentimentDissatisfied className={styles.sadIcon} />
        </div>

        {/* Message */}
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>{messages[messageIndex]}</p>

        {/* Easter Egg */}
        {showSecret && (
          <div className={styles.secret}>
            <p className={styles.secretText}>🎉 You found the secret! 🎉</p>
            <p className={styles.secretSubtext}>You clicked 404 five times!</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={handleGoBack} className={`${styles.button} ${styles.secondaryButton}`}>
            <MdArrowBack />
            <span>Go Back</span>
          </button>
          
          <Link to="/" className={`${styles.button} ${styles.primaryButton}`}>
            <MdHome />
            <span>Home</span>
          </Link>
        </div>

        {/* Hint */}
        {!showSecret && easterEggCount > 0 && (
          <p className={styles.hint}>
            💡 Hint: Click the 404 {5 - easterEggCount} more time{5 - easterEggCount !== 1 ? 's' : ''}...
          </p>
        )}
      </div>

      {/* Floating Elements */}
      <div className={styles.floatingElements}>
        <div className={styles.floatingIcon}><MdSearch /></div>
        <div className={styles.floatingIcon}><MdSearch /></div>
        <div className={styles.floatingIcon}><MdSearch /></div>
      </div>
    </div>
  );
};

export default NotFound;