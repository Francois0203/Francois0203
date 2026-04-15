import React from 'react';
import { BsLightningFill, BsPauseFill } from 'react-icons/bs';
import styles from './ReduceAnimationsSwitch.module.css';
import { useAnimations } from '../../hooks';

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Glassmorphism toggle for app-wide motion. State + persistence managed by useAnimations.
// Off (default): thumb (lightning) left, pause icon right.
// On: thumb (pause) right, lightning icon left.

const ReduceAnimationsSwitch = () => {
  const { reduceAnimations, toggleAnimations } = useAnimations();

  // Space / Enter activate like a native button
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
      <span className={`${styles.bgIcon} ${styles.bgIconLeft}`} aria-hidden="true">
        <BsLightningFill />
      </span>
      <span className={`${styles.bgIcon} ${styles.bgIconRight}`} aria-hidden="true">
        <BsPauseFill />
      </span>
      <span className={styles.thumb} aria-hidden="true">
        <span className={styles.thumbIcon}>
          {reduceAnimations ? <BsPauseFill /> : <BsLightningFill />}
        </span>
      </span>
    </button>
  );
};

export default ReduceAnimationsSwitch;