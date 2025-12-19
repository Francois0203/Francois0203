import React, { useState, useEffect } from 'react';

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

  return (
    <button
      className={`${styles.switch} ${enabled ? styles.checked : ''}`}
      onClick={toggle}
      role="switch"
      aria-checked={enabled}
      aria-label="Reduce Animations"
      type="button"
    >
      <span className={styles.thumb}></span>
    </button>
  );
};

export default ReduceAnimationsSwitch;