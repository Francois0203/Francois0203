import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/* Styling */
import styles from "./NavigationBar.module.css";
import '../../styles/Theme.css';

/* ============================================================================
 * NAVIGATION BAR COMPONENT
 * ============================================================================
 * Professional, responsive navigation bar with centered layout
 * Features:
 * - Horizontal navigation that scales on all devices
 * - Active route highlighting
 * - Smooth transitions and animations
 * - Accessible keyboard navigation
 * ============================================================================
 */

const NavigationBar = function NavigationBar({ 
  links = [], 
  onNavigate, 
  className = ""
}) {
  // ========================================
  // STATE MANAGEMENT & HOOKS
  // ========================================
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  // ========================================
  // EFFECTS
  // ========================================
  
  // Track active route based on current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const index = links.findIndex(link => link.to === currentPath);
    if (index !== -1) {
      setActiveIndex(index);
    } else if (currentPath === '/') {
      setActiveIndex(0);
    }
  }, [location.pathname, links]);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  const handleLinkClick = (link, index) => {
    setActiveIndex(index);
    
    if (link.onClick) link.onClick();
    if (link.to && onNavigate) onNavigate(link.to);
  };

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <nav className={`${styles.navbar} ${className}`} role="navigation" aria-label="Main navigation">
      <div className={styles.navContainer}>
        
        {/* Navigation Links - Always visible */}
        <ul className={styles.navLinks}>
          {links.map((link, index) => (
            <li key={`${link.label}-${index}`} className={styles.navItem}>
              <button
                className={`${styles.navLink} ${activeIndex === index ? styles.navLinkActive : ''}`}
                onClick={() => handleLinkClick(link, index)}
                type="button"
                aria-current={activeIndex === index ? 'page' : undefined}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

      </div>
    </nav>
  );
};

export default NavigationBar;