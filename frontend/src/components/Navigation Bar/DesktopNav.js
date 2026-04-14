import React, { useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

import styles from "./DesktopNav.module.css";

// ============================================================
// DESKTOP NAVIGATION
// ============================================================
// A floating glass-capsule bar positioned at the top-center of
// the viewport.  The border ring lights up based on cursor
// position (gradient-border trick) and the entire capsule emits
// a soft ambient glow that follows the cursor.

const DesktopNav = ({ links = [], onNavigate, activeTab = null }) => {
  // ----------------------------------------------------------
  // Refs
  // ----------------------------------------------------------
  const capsuleRef = useRef(null);

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------
  const [glowPos, setGlowPos]       = useState({ x: 50, y: 50 });
  const [hovered, setHovered]       = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // ----------------------------------------------------------
  // Active detection — router-driven, falls back to activeTab prop
  // ----------------------------------------------------------
  // ----------------------------------------------------------
  // Cursor tracking — drives the border rim glow
  // ----------------------------------------------------------
  const handleMouseMove = useCallback((e) => {
    const el = capsuleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setGlowPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  }, []);

  // ----------------------------------------------------------
  // Active detection — router-driven, falls back to activeTab prop
  // ----------------------------------------------------------
  const { pathname } = useLocation();

  const isActive = (link, index) => {
    // 1. Match by current pathname (exact for root, startsWith for others)
    if (link.to) {
      if (link.to === "/") return pathname === "/";
      return pathname.startsWith(link.to);
    }
    // 2. Fallback: prop-based match
    if (activeTab === null) return false;
    return activeTab === index;
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
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
      {/* Ambient glow layer (fills the capsule interior) */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Border rim glow — painted via ::before pseudo in CSS */}

      {/* Navigation links */}
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
                {/* Hover/active fill layer */}
                <span className={styles.navLinkFill} aria-hidden="true" />
                <span className={styles.navLinkLabel}>{link.label}</span>

                {/* Active indicator dot */}
                {active && (
                  <span className={styles.activeDot} aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default DesktopNav;
