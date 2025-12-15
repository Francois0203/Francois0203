import React, { useState } from 'react';

/* Icons */
import { FaSun, FaMoon } from 'react-icons/fa';

/* Styling */
import styles from './ThemeSwitch.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

const ThemeSwitch = ({ theme, toggleTheme, size = 25 }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = () => setIsPressed(true);
  const handlePointerUp = () => setIsPressed(false);

  return (
    <span
      className={`${styles['theme-switch']} ${isPressed ? styles['pressed'] : ''}`}
      onClick={toggleTheme}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      aria-label="Toggle Theme"
      role="button"
      tabIndex={0}
    >
      <span className={styles['icon']} style={{ fontSize: `${size}px` }} aria-hidden="true">
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
      </span>
    </span>
  );
};

export default ThemeSwitch;