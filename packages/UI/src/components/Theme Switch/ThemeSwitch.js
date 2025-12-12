import React, { useState } from 'react';

/* Icons */
import { Moon, Sun } from 'lucide-react';

/* Styling */
import styles from './ThemeSwitch.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/GeneralWrappers.css';

const ThemeSwitch = ({ theme, toggleTheme, size = '3em' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = () => setIsPressed(true);
  const handlePointerUp = () => setIsPressed(false);

  return (
    <button
      className={`${styles['theme-switch']} ${isPressed ? styles['pressed'] : ''}`}
      onClick={toggleTheme}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      aria-label="Toggle Theme"
      type="button"
      style={{ lineHeight: 1 }}
    >
      <span className={styles['icon']} style={{ fontSize: size }}>
        {theme === 'dark' ? <Sun /> : <Moon />}
      </span>
    </button>
  );
};

export default ThemeSwitch;