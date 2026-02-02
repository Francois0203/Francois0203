import React, { useState, useRef, useEffect } from "react";
import { HiCog } from 'react-icons/hi';
import { MdColorLens, MdSpeed } from 'react-icons/md';
import ThemeSwitch from '../Theme Switch';
import ReduceAnimationsSwitch from '../Reduce Animations Switch';

/* Styling */
import styles from "./Settings.module.css";
import '../../styles/Theme.css';

/* ============================================================================
 * SETTINGS COMPONENT
 * ============================================================================
 * Professional settings dropdown with theme and animation controls
 * Features:
 * - Floating action button with dropdown menu
 * - Smooth animations and transitions
 * - Click-outside to close functionality
 * - Keyboard accessibility (Escape to close)
 * - Responsive design for all devices
 * ============================================================================
 */

const Settings = function Settings({ 
  theme,
  toggleTheme,
  className = ""
}) {
  // ========================================
  // STATE & REFS
  // ========================================
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // ========================================
  // EFFECTS
  // ========================================
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className={`${styles.settingsContainer} ${className}`} ref={containerRef}>
      
      {/* Settings Toggle Button */}
      <button
        className={`${styles.settingsButton} ${isOpen ? styles.settingsButtonActive : ''}`}
        onClick={toggleMenu}
        type="button"
        aria-label="Settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <HiCog className={styles.cogIcon} />
      </button>

      {/* Settings Dropdown Panel */}
      <div className={`${styles.settingsPanel} ${isOpen ? styles.settingsPanelOpen : ''}`}>
        
        {/* Panel Header */}
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Settings</h3>
        </div>

        {/* Settings Options */}
        <div className={styles.settingsOptions}>
          
          {/* Theme Setting */}
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <MdColorLens className={styles.settingIcon} />
              <div className={styles.settingText}>
                <span className={styles.settingName}>Theme</span>
                <span className={styles.settingDescription}>Switch between light and dark mode</span>
              </div>
            </div>
            <div className={styles.settingControl}>
              <ThemeSwitch
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </div>
          </div>

          {/* Animations Setting */}
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <MdSpeed className={styles.settingIcon} />
              <div className={styles.settingText}>
                <span className={styles.settingName}>Reduce Animations</span>
                <span className={styles.settingDescription}>Minimize motion for better performance</span>
              </div>
            </div>
            <div className={styles.settingControl}>
              <ReduceAnimationsSwitch />
            </div>
          </div>

        </div>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={closeMenu}
          role="presentation"
        />
      )}
    </div>
  );
};

export default Settings;