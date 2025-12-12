import React, { useState, useRef, useEffect } from "react";
import { Home, Waypoints } from 'lucide-react';

/* Styling */
import styles from "./NavigationBar.module.css";
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/GeneralWrappers.css';

/**
 * Modern NavigationBar component - Click to open dropdown with hover submenus
 */
const NavigationBar = function NavigationBar({ 
  links, 
  onNavigate, 
  burgerSize = 44,
  className = ""
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMain, setHoveredMain] = useState(null);
  const wrapperRef = useRef();
  const hoverTimeouts = useRef({});

  // Clear all hover timeouts
  const clearAllTimeouts = () => {
    Object.values(hoverTimeouts.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    hoverTimeouts.current = {};
  };

  // Handle burger menu click - toggle open/close
  const handleBurgerClick = () => {
    setMenuOpen(prev => !prev);
    if (menuOpen) {
      setHoveredMain(null);
    }
  };

  // Handle main link interactions
  const handleMainClick = (link, index) => {
    if (link.subLinks) {
      // If it has sublinks, toggle the submenu for mobile
      if (window.innerWidth <= 768) {
        setHoveredMain(hoveredMain === index ? null : index);
      }
    } else {
      // If no sublinks, navigate directly
      if (link.onClick) link.onClick();
      if (link.to) onNavigate(link.to);
      setMenuOpen(false);
      setHoveredMain(null);
    }
  };

  // Handle sublink clicks
  const handleSubClick = (subLink) => {
    if (subLink.onClick) subLink.onClick();
    if (subLink.to) onNavigate(subLink.to);
    setMenuOpen(false);
    setHoveredMain(null);
  };

  // Handle mouse enter on main links (for desktop hover)
  const handleMainHover = (index) => {
    if (window.innerWidth > 768) { // Only on desktop
      clearAllTimeouts();
      setHoveredMain(index);
    }
  };

  // Handle mouse leave on main links
  const handleMainLeave = () => {
    if (window.innerWidth > 768) { // Only on desktop
      hoverTimeouts.current.submenu = setTimeout(() => {
        setHoveredMain(null);
      }, 200);
    }
  };

  // Handle dropdown hover to keep it open
  const handleDropdownHover = () => {
    clearAllTimeouts();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
        setHoveredMain(null);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearAllTimeouts();
    };
  }, [menuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setHoveredMain(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <nav 
      className={`${styles.navbar} ${className}`} 
      ref={wrapperRef}
    >
      {/* Burger Button */}
      <div className={styles.burgerRow}>
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={handleBurgerClick}
          type="button"
          style={{
            width: burgerSize,
            height: burgerSize,
            minWidth: burgerSize,
            minHeight: burgerSize,
          }}
        >
          <span className={styles.burgerBar}></span>
          <span className={styles.burgerBar}></span>
          <span className={styles.burgerBar}></span>
        </button>
      </div>

      {/* Navigation Menu */}
      {menuOpen && (
        <div 
          className={`${styles.menuDropdown} ${styles.menuDropdownOpen}`}
          onMouseEnter={handleDropdownHover}
        >
          <ul className={styles.mainLinks}>
            {/* Render Home and Hub as standalone icons outside mainLink */}
            {links.map((link, index) => {
              if (link.label === 'Home') {
                return (
                  <li key="nav-home-icon" className={styles.iconStandaloneItem}>
                    <button
                      className={styles.iconStandalone}
                      title="Home"
                      onClick={() => handleMainClick(link, index)}
                      type="button"
                    >
                      <Home size={22} />
                    </button>
                  </li>
                );
              }
              if (link.label === 'Hub') {
                return (
                  <li key="nav-hub-icon" className={styles.iconStandaloneItem}>
                    <button
                      className={styles.iconStandalone}
                      title="Hub"
                      onClick={() => handleMainClick(link, index)}
                      type="button"
                    >
                      <Waypoints size={20} />
                    </button>
                  </li>
                );
              }
              // Render normal nav links
              return (
                <li 
                  key={`${link.label}-${index}`} 
                  className={styles.mainLinkItem}
                  onMouseEnter={() => handleMainHover(index)}
                  onMouseLeave={handleMainLeave}
                >
                  <button
                    className={`${styles.mainLink} ${hoveredMain === index ? styles.mainLinkHovered : ""}`}
                    onClick={() => handleMainClick(link, index)}
                    aria-expanded={link.subLinks ? hoveredMain === index : undefined}
                  >
                    <span className={styles.mainLinkText}>{link.label}</span>
                    {link.subLinks && (
                      <span className={`${styles.dropdownIcon} ${hoveredMain === index ? styles.dropdownIconOpen : ""}`}>
                        ▼
                      </span>
                    )}
                  </button>
                  {/* Sublinks Dropdown */}
                  {link.subLinks && hoveredMain === index && (
                    <div 
                      className={`${styles.subDropdown} ${styles.subDropdownOpen}`}
                      onMouseEnter={handleDropdownHover}
                    >
                      <ul className={styles.subLinks}>
                        {[...link.subLinks]
                          .sort((a, b) => a.label.localeCompare(b.label))
                          .map((subLink, subIndex) => (
                            <li key={`${subLink.label}-${subIndex}`} className={styles.subLinkItem}>
                              <button
                                className={styles.subLink}
                                onClick={() => handleSubClick(subLink)}
                              >
                                {subLink.label}
                              </button>
                            </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;