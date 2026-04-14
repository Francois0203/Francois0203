import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoSettingsSharp } from 'react-icons/io5';
import { FaSun, FaMoon } from 'react-icons/fa';
import { BsLightningFill, BsPauseFill } from 'react-icons/bs';
import { useAnimations } from '../../hooks';

import styles from "./Settings.module.css";

// ============================================================
// BUBBLE CONFIGURATION
// ============================================================
// tx / ty: translation from trigger center (px) when open.
// Designed for a top-right fixed anchor → bubbles fan down-left.
const BUBBLES = [
  { id: 'theme',      label: 'Theme',  tx: -88, ty: 62,  delay: '0s'     },
  { id: 'animations', label: 'Motion', tx: -22, ty: 90,  delay: '0.06s'  },
];

// ============================================================
// TRIGGER BUTTON
// ============================================================
// Circular glass button with a cursor-following glow when closed.

const TriggerButton = ({ isOpen, onClick, size }) => {
  const ref = useRef(null);
  const [glowPos, setGlowPos]   = useState({ x: 50, y: 50 });
  const [hovered, setHovered]   = useState(false);

  const handleMouseMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setGlowPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  }, []);

  const iconSize = Math.round(size * 0.46);

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
      style={{
        width:  size,
        height: size,
        /* CSS custom properties consumed by the ::before glow layer */
        '--glow-x':    `${glowPos.x}%`,
        '--glow-y':    `${glowPos.y}%`,
        '--glow-show': (!isOpen && hovered) ? '1' : '0',
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isOpen ? 'Close settings' : 'Open settings'}
      aria-expanded={isOpen}
    >
      <IoSettingsSharp size={iconSize} className={styles.triggerIcon} />
    </button>
  );
};

// ============================================================
// SETTING BUBBLES
// ============================================================
// Each setting is a self-contained circular button that directly
// applies its action on click. Pair them explicitly so each can
// own its own state (theme vs. animations).

const ThemeBubble = ({ cfg, isOpen, theme, toggleTheme }) => {
  const isDark = theme === 'dark';
  const Icon   = isDark ? FaMoon : FaSun;

  return (
    <div
      className={`${styles.bubbleAnchor} ${isOpen ? styles.bubbleAnchorOpen : ''}`}
      style={{ '--tx': `${cfg.tx}px`, '--ty': `${cfg.ty}px`, '--delay': cfg.delay }}
    >
      <button
        type="button"
        className={`${styles.bubble} ${isDark ? styles.bubbleActive : ''}`}
        onClick={toggleTheme}
        tabIndex={isOpen ? 0 : -1}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
      >
        <Icon className={styles.bubbleIcon} />
      </button>
      <span className={styles.bubbleLabel} aria-hidden="true">{cfg.label}</span>
    </div>
  );
};

const AnimationsBubble = ({ cfg, isOpen }) => {
  const { reduceAnimations, toggleAnimations } = useAnimations();
  const Icon = reduceAnimations ? BsPauseFill : BsLightningFill;

  return (
    <div
      className={`${styles.bubbleAnchor} ${isOpen ? styles.bubbleAnchorOpen : ''}`}
      style={{ '--tx': `${cfg.tx}px`, '--ty': `${cfg.ty}px`, '--delay': cfg.delay }}
    >
      <button
        type="button"
        className={`${styles.bubble} ${reduceAnimations ? styles.bubbleActive : ''}`}
        onClick={toggleAnimations}
        tabIndex={isOpen ? 0 : -1}
        aria-label={reduceAnimations ? 'Enable animations' : 'Reduce animations'}
        aria-pressed={reduceAnimations}
      >
        <Icon className={styles.bubbleIcon} />
      </button>
      <span className={styles.bubbleLabel} aria-hidden="true">{cfg.label}</span>
    </div>
  );
};

// ============================================================
// SETTINGS — ROOT COMPONENT
// ============================================================

const Settings = ({ theme, toggleTheme, cogSize = 52, className = '' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const toggle = () => setMenuOpen(prev => !prev);
  const close  = useCallback(() => setMenuOpen(false), []);

  // Close when clicking outside the container
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, close]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  const [themeCfg, animCfg] = BUBBLES;

  /*
   * Portal the entire container to <body> so it lives in the root stacking
   * context. Without this, the App's .themeSwitch wrapper (position:fixed +
   * z-index:1021) creates a local stacking context that traps Settings below
   * the portalled backdrop (z-index:1040).
   */
  /*
   * The backdrop MUST be a sibling of .container, not a child.
   * .container is position:fixed which creates its own stacking context —
   * any child z-index is scoped inside it, so a backdrop child at z:1040
   * would paint over the bubbles at z:1 within that same context.
   * Rendering both at the body level makes z-index comparison direct:
   *   container z:1050  >  backdrop z:1040  >  page content.
   */
  return createPortal(
    <>
      {/* Backdrop sits BELOW the container in z-index, but above page content */}
      {menuOpen && (
        <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      )}

      <div className={`${styles.container} ${className}`} ref={containerRef}>
        {/* Bubbles rendered before trigger so trigger is on top in DOM order */}
        <ThemeBubble      cfg={themeCfg} isOpen={menuOpen} theme={theme} toggleTheme={toggleTheme} />
        <AnimationsBubble cfg={animCfg}  isOpen={menuOpen} />
        <TriggerButton isOpen={menuOpen} onClick={toggle} size={cogSize} />
      </div>
    </>,
    document.body
  );
};

export default Settings;