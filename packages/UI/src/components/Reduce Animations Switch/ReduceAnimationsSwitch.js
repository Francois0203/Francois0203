import React, { useState, useEffect } from 'react';
import { FaStopwatch } from 'react-icons/fa';

import styles from './ReduceAnimationsSwitch.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

const STORAGE_KEY = 'reduceAnimations';

const ReduceAnimationsSwitch = ({ size = 22 }) => {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.setAttribute('data-no-animations', 'true');
    } else {
      root.removeAttribute('data-no-animations');
    }
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (e) {}
  }, [enabled]);

  const toggle = () => setEnabled((v) => !v);
  const handlePointerDown = () => setIsPressed(true);
  const handlePointerUp = () => setIsPressed(false);

  return (
    <span
      className={`${styles['reduce-switch']} ${isPressed ? styles['pressed'] : ''}`}
      onClick={toggle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="button"
      aria-pressed={enabled}
      tabIndex={0}
      aria-label="Reduce Animations"
    >
      <span className={styles.icon} style={{ fontSize: `${size}px` }} aria-hidden="true">
        <FaStopwatch />
      </span>
      <span className={styles.badge} aria-hidden="true">{enabled ? 'Off' : 'On'}</span>
    </span>
  );
};

export default ReduceAnimationsSwitch;