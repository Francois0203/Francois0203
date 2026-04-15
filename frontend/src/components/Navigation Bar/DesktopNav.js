import React, { useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

import styles from "./DesktopNav.module.css";

// \u2500\u2500\u2500 COMPONENT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Floating glass-capsule nav bar. Border rim + ambient glow follow the cursor.

const DesktopNav = ({ links = [], onNavigate, activeTab = null }) => {
  const capsuleRef = useRef(null);

  const [glowPos,    setGlowPos]    = useState({ x: 50, y: 50 });
  const [hovered,    setHovered]    = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // \u2500\u2500\u2500 CURSOR TRACKING \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // Drives border rim glow via CSS custom properties.

  const handleMouseMove = useCallback((e) => {
    const el = capsuleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setGlowPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
    // Re-enable glow after navigation may have triggered a spurious mouseleave
    setHovered(true);
  }, []);

  // \u2500\u2500\u2500 ACTIVE DETECTION \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // Router-driven; falls back to the activeTab prop index.

  const { pathname } = useLocation();

  const isActive = (link, index) => {
    if (link.to) {
      if (link.to === "/") return pathname === "/";
      return pathname.startsWith(link.to);
    }
    if (activeTab === null) return false;
    return activeTab === index;
  };

  // \u2500\u2500\u2500 RENDER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  return (
    <nav
      ref={capsuleRef}
      className={styles.capsule}
      aria-label="Desktop navigation"
      style={{
        "--glow-x":    `${glowPos.x}%`,
        "--glow-y":    `${glowPos.y}%`,
        "--glow-show": hovered ? "1" : "0",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setHoveredIdx(null); }}
    >
      {/* Ambient glow fills the capsule interior */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      <ul className={styles.linkList}>
        {links.map((link, index) => {
          const active  = isActive(link, index);
          const ishover = hoveredIdx === index;

          return (
            <li key={`desktop-nav-${index}`} role="none">
              <button
                type="button"
                className={[
                  styles.navLink,
                  active  ? styles.navLinkActive  : "",
                  ishover ? styles.navLinkHovered : "",
                ].filter(Boolean).join(" ")}
                onClick={() => {
                  if (link.onClick) link.onClick();
                  if (link.to) onNavigate(link.to, index);
                }}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                aria-current={active ? "page" : undefined}
              >
                <span className={styles.navLinkFill} aria-hidden="true" />
                <span className={styles.navLinkLabel}>{link.label}</span>
                {active && <span className={styles.activeDot} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DesktopNav;
