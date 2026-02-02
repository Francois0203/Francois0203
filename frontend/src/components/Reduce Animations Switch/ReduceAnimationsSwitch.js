import React, { useState, useEffect } from 'react';

/* Styling */
import styles from './ReduceAnimationsSwitch.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * REDUCE ANIMATIONS SWITCH COMPONENT
 * ============================================================================
 * Toggle switch for enabling/disabling animations
 * Persists preference to localStorage
 * ============================================================================
 */

const STORAGE_KEY = 'reduceAnimations';

const ReduceAnimationsSwitch = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    const root = document.documentElement;
    
    if (enabled) {
      root.setAttribute('data-no-animations', 'true');
    } else {
      root.removeAttribute('data-no-animations');
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (e) {
      // Storage error - ignore
    }
  }, [enabled]);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  const toggle = () => setEnabled((prev) => !prev);

  // ========================================
  // RENDER
  // ========================================
  return (
    <button
      className={`${styles.switch} ${enabled ? styles.checked : ''}`}
      onClick={toggle}
      role="switch"
      aria-checked={enabled}
      aria-label="Reduce Animations"
      type="button"
    >
      <span className={styles.thumb} />
    </button>
  );
};

export default ReduceAnimationsSwitch;