import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [secondaryColor, setSecondaryColor] = useState("#30d5c8");

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSecondaryColor(newColor);
    const root = document.documentElement;
    root.style.setProperty("--secondary-bg", newColor);
    root.style.setProperty("--tersiary-text", newColor);
    root.style.setProperty("--hover-effect", `rgba(${hexToRgb(newColor)}, 0.2)`);
  };

  const resetTheme = () => {
    const defaultColor = "#30d5c8";
    const root = document.documentElement;
    root.style.setProperty("--secondary-bg", defaultColor);
    root.style.setProperty("--tersiary-text", defaultColor);
    root.style.setProperty("--hover-effect", `rgba(${hexToRgb(defaultColor)}, 0.2)`);
    setSecondaryColor(defaultColor);
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>Francois Website</Link>
      <div className={styles.links}>
        <Link to="/about" className={styles.link}>About Me</Link>
        <Link to="/projects" className={styles.link}>Projects</Link>
      </div>
      <div
        className={styles.settings}
        onMouseEnter={openSettings}
        onMouseLeave={closeSettings}
      >
        <div className={styles.wheel}>⚙️</div>
        <div
          className={`${styles.dropdown} ${!settingsOpen ? styles.hidden : ""}`}
        >
          <div className={styles.dropdownItem}>
            <label htmlFor="colorPicker" className={styles.label}>
              Change Secondary Color
            </label>
            <input
              type="color"
              id="colorPicker"
              value={secondaryColor}
              onChange={handleColorChange}
              className={styles.colorPicker}
            />
          </div>
          <button
            className={`${styles.dropdownItem} ${styles.actionButton}`}
            onClick={resetTheme}
          >
            Reset Theme
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;