import React, { useState, useRef, useEffect } from "react";
import { GiCog } from 'react-icons/gi';
import { IoColorPaletteSharp } from 'react-icons/io5';
import ThemeSwitch from '../Theme Switch';

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
  const wrapperRef = useRef();
  const menuRef = useRef();

  // Handle cog button click - toggle open/close
  const handleCogClick = () => {
    setMenuOpen(prev => !prev);
  };

  // Close menu when clicking outside of button or menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(event.target);
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
      
      if (clickedOutsideWrapper && clickedOutsideMenu) {
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
    <div className={`${styles.settingsContainer} ${className}`}>
      {/* Cog Button */}
      <div className={styles.cogRow} ref={wrapperRef}>
        <button
          className={`${styles.cogButton} ${menuOpen ? styles.cogButtonOpen : ""}`}
          aria-label="Toggle settings menu"
          aria-expanded={menuOpen}
          onClick={handleCogClick}
          type="button"
          style={{
            width: cogSize,
            height: cogSize,
            minWidth: cogSize,
            minHeight: cogSize,
          }}
        >
          <GiCog className={styles.cogIcon} />
        </button>
      </div>

      {/* Settings Menu */}
      {menuOpen && (
        <div 
          className={`${styles.settingsDropdown} ${styles.settingsDropdownOpen}`}
          ref={menuRef}
        >
          {/* Background decorations */}
          <div className={styles.settingsBackground}>
            <div className={styles.cogDecoration}>
              <GiCog />
            </div>
            <div className={styles.cogDecoration}>
              <GiCog />
            </div>
            <div className={styles.cogDecoration}>
              <GiCog />
            </div>
          </div>

          {/* Settings Content */}
          <div className={styles.settingsContent}>
            {/* Theme Setting */}
            <div className={styles.settingRow}>
              <div className={styles.settingControl}>
                <ThemeSwitch
                  theme={theme}
                  toggleTheme={toggleTheme}
                  size={32}
                />
              </div>
              <div className={styles.settingInfo}>
                <span className={styles.settingIcon}>
                  <IoColorPaletteSharp />
                </span>
                <div className={styles.settingText}>
                  <span className={styles.settingLabel}>Theme</span>
                  <span className={styles.settingDescription}>Change appearance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;