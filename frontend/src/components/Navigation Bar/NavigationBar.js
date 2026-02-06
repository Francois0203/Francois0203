import React, { useState, useRef, useEffect } from "react";
import {
  LuCpu,
  LuTerminal,
  LuDatabase,
  LuCode,
  LuServer,
  LuGitBranch,
  LuActivity,
  LuMenu,
  LuX
} from "react-icons/lu";

// ============================================
// IMPORTS - STYLING
// ============================================

import styles from "./NavigationBar.module.css";

// ============================================
// CONSTANTS
// ============================================

// Icon set for navigation links
const ICONS = [LuCpu, LuTerminal, LuDatabase, LuCode, LuServer, LuGitBranch, LuActivity, LuMenu, LuX];

// ============================================
// NAVIGATION BAR COMPONENT
// ============================================
// Liquid-glass burger menu navigation

const NavigationBar = ({
  links,
  onNavigate,
  activeTab = null,
  burgerSize = 50,
  className = ""
}) => {
  // ----------------------------------------
  // State & Refs
  // ----------------------------------------

  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  const containerRef = useRef(null);

  // ----------------------------------------
  // Derived Helpers
  // ----------------------------------------

  const burgerIconSize = Math.max(18, Math.round(burgerSize * 0.6));

  const isActive = (link, index) => {
    if (activeTab === null) return false;
    return activeTab === index || activeTab === link.to;
  };

  // ----------------------------------------
  // Event Handlers
  // ----------------------------------------

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const closeMenu = () => {
    setMenuOpen(false);
    setHoveredLink(null);
  };

  const handleLinkClick = (link, index) => {
    if (link.onClick) link.onClick();
    if (link.to) onNavigate(link.to, index);
    closeMenu();
  };

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (
    <div className={`${styles.navbarContainer} ${className}`} ref={containerRef}>
      <nav className={styles.navbar} aria-label="Main navigation">
        
        {/* Burger Button */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMenu();
            }
          }}
          style={{
            width: burgerSize,
            height: burgerSize,
            minWidth: burgerSize,
            minHeight: burgerSize,
          }}
        >
          {menuOpen ? (
            <LuX size={burgerIconSize} className={styles.burgerIcon} />
          ) : (
            <LuMenu size={burgerIconSize} className={styles.burgerIcon} />
          )}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            className={`${styles.menuDropdown} ${styles.menuDropdownOpen}`}
            role="menu"
          >
            <ul className={styles.linkList} role="menubar">
              {links && links.slice(0, 7).map((link, index) => {
                const Icon = ICONS[index];
                const active = isActive(link, index);
                const hovered = hoveredLink === index;

                return (
                  <li
                    key={`nav-${index}`}
                    className={styles.linkItem}
                    role="none"
                    onMouseEnter={() => setHoveredLink(index)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <div
                      className={[
                        styles.link,
                        hovered ? styles.linkHovered : "",
                        active ? styles.linkActive : "",
                      ].join(" ")}
                      onClick={() => handleLinkClick(link, index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleLinkClick(link, index);
                        }
                      }}
                      role="menuitem"
                      tabIndex={0}
                      aria-current={active ? "page" : undefined}
                      data-index={index}
                    >
                      {/* Icon pill */}
                      <div className={styles.linkIcon}>
                        <Icon size={20} />
                      </div>

                      {/* Label */}
                      <span className={styles.linkLabel}>{link.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Backdrop Overlay - outside nav, below burger */}
      {menuOpen && (
        <div
          className={styles.backdrop}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default NavigationBar;