import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import styles from './ThemeSwitch.module.css';

const ThemeSwitch = ({ theme, toggleTheme }) => {
    return (
        <button 
            className={styles.themeSwitch}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <FaMoon className={styles.icon} />
            ) : (
                <FaSun className={styles.icon} />
            )}
        </button>
    );
};

export default ThemeSwitch;
