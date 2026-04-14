import React from 'react';
import { BsLightningFill, BsPauseFill } from 'react-icons/bs';

/* Styling */
import styles from './ReduceAnimationsSwitch.module.css';

/* Shared animation state hook */
import { useAnimations } from '../../hooks';

/* ============================================================================
 * REDUCE ANIMATIONS SWITCH COMPONENT
 * ============================================================================
 * Premium glassmorphism toggle for enabling / disabling motion across the app.
 *
 * reduceAnimations = false (default) → thumb (lightning) on the left,
 *                                      pause icon shown in the right track area.
 * reduceAnimations = true            → thumb (pause) on the right,
 *                                      lightning icon shown in the left track area.
 *
 * State & persistence are managed by the useAnimations hook, which sets the
 * `data-no-animations` attribute on <html> and writes to localStorage.
 * ============================================================================
 */

const ReduceAnimationsSwitch = () => {
  const { reduceAnimations, toggleAnimations } = useAnimations();

  /* Allow Space / Enter to activate like a native button */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAnimations();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduceAnimations}
      aria-label={
        reduceAnimations
          ? 'Animations reduced — click to enable'
          : 'Animations enabled — click to reduce'
      }
      className={`${styles.track} ${reduceAnimations ? styles.checked : ''}`}
      onClick={toggleAnimations}
      onKeyDown={handleKeyDown}
    >
      {/* Background icon: lightning — fades in on the left when reduce is active */}
      <span className={`${styles.bgIcon} ${styles.bgIconLeft}`} aria-hidden="true">
        <BsLightningFill />
      </span>

      {/* Background icon: pause — fades in on the right when animations are enabled */}
      <span className={`${styles.bgIcon} ${styles.bgIconRight}`} aria-hidden="true">
        <BsPauseFill />
      </span>

      {/* Sliding thumb — shows the icon for the current active state */}
      <span className={styles.thumb} aria-hidden="true">
        <span className={styles.thumbIcon}>
          {reduceAnimations ? <BsPauseFill /> : <BsLightningFill />}
        </span>
      </span>
    </button>
  );
};

export default ReduceAnimationsSwitch;