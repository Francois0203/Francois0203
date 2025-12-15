import React, { useState, useRef, useEffect } from "react";
import { GiShield, GiChestArmor, GiBootKick, GiBeltArmor, GiHelmet, GiSwordsEmblem, GiHolyHandGrenade } from 'react-icons/gi';

/* Styling */
import styles from "./NavigationBar.module.css";
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

// The 7 pieces of Armor of God with corresponding icons
const ARMOR_OF_GOD = [
  { icon: GiBeltArmor, name: "Belt of Truth", description: "Stand firm with truth" },
  { icon: GiChestArmor, name: "Breastplate of Righteousness", description: "Protected by righteousness" },
  { icon: GiBootKick, name: "Shoes of Peace", description: "Walk in peace" },
  { icon: GiShield, name: "Shield of Faith", description: "Faith protects us" },
  { icon: GiHelmet, name: "Helmet of Salvation", description: "Salvation guards our minds" },
  { icon: GiSwordsEmblem, name: "Sword of the Spirit", description: "The Word of God" },
  { icon: GiHolyHandGrenade, name: "Prayer", description: "Pray in the Spirit" }
];

/**
 * Christian-themed NavigationBar with burger menu icon
 * Features the 7 pieces of Armor of God as navigation links
 */
const NavigationBar = function NavigationBar({ 
  links, 
  onNavigate, 
  burgerSize = 44,
  className = ""
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const wrapperRef = useRef();
  const menuRef = useRef();

  // Handle burger button click - toggle open/close
  const handleBurgerClick = () => {
    setMenuOpen(prev => !prev);
  };

  // Handle link click
  const handleLinkClick = (link, index) => {
    if (link.onClick) link.onClick();
    if (link.to) onNavigate(link.to);
    setMenuOpen(false);
    setHoveredLink(null);
  };

  // Close menu when clicking outside of button or menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the wrapper (button) and menu
      const clickedOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(event.target);
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
      
      if (clickedOutsideWrapper && clickedOutsideMenu) {
        setMenuOpen(false);
        setHoveredLink(null);
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
        setHoveredLink(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <nav 
      className={`${styles.navbar} ${className}`}
    >
      {/* Burger Menu Button */}
      <div className={styles.burgerRow} ref={wrapperRef}>
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
          {/* Burger Lines */}
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>
      </div>

      {/* Navigation Menu */}
      {menuOpen && (
        <div 
          className={`${styles.menuDropdown} ${styles.menuDropdownOpen}`}
          ref={menuRef}
        >
          {/* Armor of God background decorations */}
          <div className={styles.armorBackground}>
            {ARMOR_OF_GOD.map((armor, index) => {
              const ArmorIcon = armor.icon;
              return (
                <div 
                  key={`armor-bg-${index}`} 
                  className={styles.armorIconBg}
                  style={{ '--armor-index': index }}
                >
                  <ArmorIcon />
                </div>
              );
            })}
          </div>

          {/* Main Navigation Links - Vertical */}
          <ul className={styles.mainLinks}>
            {links.slice(0, 7).map((link, index) => {
              const ArmorIcon = ARMOR_OF_GOD[index]?.icon || GiShield;
              const armorPiece = ARMOR_OF_GOD[index];
              
              return (
                <li 
                  key={`${link.label}-${index}`} 
                  className={styles.mainLinkItem}
                  onMouseEnter={() => setHoveredLink(index)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <button
                    className={`${styles.mainLink} ${hoveredLink === index ? styles.mainLinkHovered : ""}`}
                    onClick={() => handleLinkClick(link, index)}
                    type="button"
                    title={armorPiece?.description}
                  >
                    <span className={styles.armorIcon}>
                      <ArmorIcon />
                    </span>
                    <span className={styles.linkContent}>
                      <span className={styles.mainLinkText}>{link.label}</span>
                      {armorPiece && (
                        <span className={styles.armorName}>{armorPiece.name}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {/* Backdrop overlay to blur the rest of the page when menu is open */}
      {menuOpen && <div className={styles.backdrop} onClick={() => { setMenuOpen(false); setHoveredLink(null); }}></div>}
    </nav>
  );
};

export default NavigationBar;