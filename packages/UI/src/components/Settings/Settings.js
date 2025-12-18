import React, { useState, useRef, useEffect } from "react";
import { GiCog } from 'react-icons/gi';
import { IoColorPaletteSharp } from 'react-icons/io5';
import { FaStopwatch } from 'react-icons/fa';
import ThemeSwitch from '../Theme Switch';
import ReduceAnimationsSwitch from '../Reduce Animations Switch';

/* Styling */
import styles from "./Settings.module.css";
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

/**
 * Settings component with cog icon
 * Features animated dropdown with theme switching capability
 */
const Settings = function Settings({ 
  theme,
  toggleTheme,
  cogSize = 44,
  className = ""
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef();

  // Handle cog button click - toggle open/close
  const handleCogClick = () => {
    setMenuOpen(prev => !prev);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className={`${styles.settingsContainer} ${className}`} ref={containerRef}>
      {/* Cog Button - Fixed in top right */}
      <button
        className={`${styles.cogButton} ${menuOpen ? styles.cogButtonActive : ""}`}
        aria-label="Toggle settings menu"
        aria-expanded={menuOpen}
        onClick={handleCogClick}
        type="button"
        style={{
          width: cogSize,
          height: cogSize,
        }}
      >
        <GiCog className={styles.cogIcon} />
        <div className={styles.cogGlow}></div>
      </button>

      {/* Settings Dropdown Menu */}
      <div className={`${styles.settingsDropdown} ${menuOpen ? styles.dropdownOpen : ""}`}>
        {/* Animated background particles */}
        <div className={styles.particlesBackground}>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
        </div>

        {/* Menu Header */}
        <div className={styles.menuHeader}>
          <h3 className={styles.menuTitle}>Settings</h3>
          <div className={styles.headerLine}></div>
        </div>

        {/* Settings Content */}
        <div className={styles.settingsContent}>
          {/* Theme Setting */}
          <div className={styles.settingItem}>
            <div className={styles.settingLeft}>
              <div className={styles.iconWrapper}>
                <IoColorPaletteSharp className={styles.settingIcon} />
              </div>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Theme</h4>
                <p className={styles.settingDescription}>Customize appearance</p>
              </div>
            </div>
            <div className={styles.settingControl}>
              <ThemeSwitch
                theme={theme}
                toggleTheme={toggleTheme}
                size={32}
              />
            </div>
          </div>
          {/* Reduce Animations Setting */}
          <div className={styles.settingItem}>
            <div className={styles.settingLeft}>
              <div className={styles.iconWrapper}>
                <FaStopwatch className={styles.settingIcon} />
              </div>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingLabel}>Reduce animations</h4>
                <p className={styles.settingDescription}>Disable non-essential UI animations</p>
              </div>
            </div>
            <div className={styles.settingControl}>
              <ReduceAnimationsSwitch size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)}></div>}
    </div>
  );
};

export default Settings;