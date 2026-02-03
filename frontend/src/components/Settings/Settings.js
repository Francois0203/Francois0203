import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { GiCog } from 'react-icons/gi';
import { IoColorPaletteSharp } from 'react-icons/io5';
import { FaStopwatch } from 'react-icons/fa';
import ThemeSwitch from '../Theme Switch';
import ReduceAnimationsSwitch from '../Reduce Animations Switch';

// ============================================
// IMPORTS - STYLING
// ============================================

import styles from "./Settings.module.css";
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

// ============================================
// SETTINGS COMPONENT
// ============================================
// Floating settings panel with morphing animations
// Features liquid glass effect and gradient backgrounds

const Settings = function Settings({ 
  theme,
  toggleTheme,
  cogSize = 45,
  className = ""
}) {
  // ----------------------------------------
  // State & Refs
  // ----------------------------------------
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredSetting, setHoveredSetting] = useState(null);
  const containerRef = useRef();

  // ----------------------------------------
  // Event Handlers
  // ----------------------------------------
  
  const handleCogClick = () => {
    setMenuOpen(prev => !prev);
  };

  // ----------------------------------------
  // Effects
  // ----------------------------------------
  // Handle click outside to close menu
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(false);
        setHoveredSetting(null);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setHoveredSetting(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // ----------------------------------------
  // Render
  // ----------------------------------------
  
  return (
    <div className={`${styles.settingsContainer} ${className}`} ref={containerRef}>
      {/* Floating Cog Button */}
      <div
        className={`${styles.cogButton} ${menuOpen ? styles.cogButtonActive : ""}`}
        onClick={handleCogClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCogClick();
          }
        }}
        aria-label="Toggle settings menu"
        aria-expanded={menuOpen}
        style={{
          width: cogSize,
          height: cogSize,
        }}
      >
        <GiCog className={styles.cogIcon} />
      </div>

      {/* Settings Panel */}
      {menuOpen && (
        <div className={styles.settingsPanel}>
          {/* Animated gradient background */}
          <div className={styles.gradientBackground}>
            <div className={styles.gradientOrb} data-orb="1"></div>
            <div className={styles.gradientOrb} data-orb="2"></div>
            <div className={styles.gradientOrb} data-orb="3"></div>
            <div className={styles.gradientOrb} data-orb="4"></div>
          </div>

          {/* Settings Header */}
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Preferences</h3>
            <div className={styles.headerAccent}></div>
          </div>

          {/* Settings Content */}
          <div className={styles.settingsContent}>
            {/* Theme Setting */}
            <div 
              className={`${styles.settingCard} ${hoveredSetting === 0 ? styles.settingCardHovered : ''}`}
              onMouseEnter={() => setHoveredSetting(0)}
              onMouseLeave={() => setHoveredSetting(null)}
              data-accent="1"
            >
              <div className={styles.cardGlow}></div>
              <div className={styles.settingMain}>
                <div className={styles.settingIconBox}>
                  <IoColorPaletteSharp className={styles.settingIcon} />
                  <div className={styles.iconPulse}></div>
                </div>
                <div className={styles.settingDetails}>
                  <h4 className={styles.settingTitle}>Appearance</h4>
                  <p className={styles.settingSubtitle}>Switch between light & dark mode</p>
                </div>
              </div>
              <div className={styles.settingAction}>
                <ThemeSwitch
                  theme={theme}
                  toggleTheme={toggleTheme}
                  size={32}
                />
              </div>
              <svg className={styles.cardBrush} viewBox="0 0 200 4" preserveAspectRatio="none">
                <path 
                  d="M0,2 Q50,0 100,2 T200,2" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Animations Setting */}
            <div 
              className={`${styles.settingCard} ${hoveredSetting === 1 ? styles.settingCardHovered : ''}`}
              onMouseEnter={() => setHoveredSetting(1)}
              onMouseLeave={() => setHoveredSetting(null)}
              data-accent="2"
            >
              <div className={styles.cardGlow}></div>
              <div className={styles.settingMain}>
                <div className={styles.settingIconBox}>
                  <FaStopwatch className={styles.settingIcon} />
                  <div className={styles.iconPulse}></div>
                </div>
                <div className={styles.settingDetails}>
                  <h4 className={styles.settingTitle}>Motion</h4>
                  <p className={styles.settingSubtitle}>Reduce animations for accessibility</p>
                </div>
              </div>
              <div className={styles.settingAction}>
                <ReduceAnimationsSwitch size={20} />
              </div>
              <svg className={styles.cardBrush} viewBox="0 0 200 4" preserveAspectRatio="none">
                <path 
                  d="M0,2 Q50,0 100,2 T200,2" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay — portalled to body so it escapes the stacking context */}
      {menuOpen && createPortal(
        <div 
          className={styles.backdrop} 
          onClick={() => {
            setMenuOpen(false);
            setHoveredSetting(null);
          }}
        />,
        document.body
      )}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default Settings;