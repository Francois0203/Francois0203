import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  LuHouse,
  LuUser,
  LuCode,
  LuMail,
  LuHash,
  LuBriefcase,
} from "react-icons/lu";

import styles from "./MobileNav.module.css";

// ============================================================
// ICON MAP
// ============================================================
// Maps common link labels (lowercase) to Lucide icon components.
// If the link supplies its own `icon` prop, that takes priority.
// Falls back to LuHash when no match is found.

const LABEL_ICON_MAP = {
  home:               LuHouse,
  bio:                LuUser,
  projects:           LuBriefcase,
  "notable projects": LuBriefcase,
  contact:            LuMail,
  code:               LuCode,
};

function resolveIcon(link) {
  if (link.icon) return link.icon;
  const key = link.label?.toLowerCase().trim() ?? "";
  return LABEL_ICON_MAP[key] || LuHash;
}

// ============================================================
// CONSTANTS
// ============================================================

// Full angle (degrees) of the upward arc, centered at 90° (directly above).
// Endpoints land at (90 ± ARC_SPAN/2)° — 30° and 150° with a 120° span,
// so every bubble is clearly above the trigger (none at the screen bottom).
const ARC_SPAN   = 120;

// Radius (px) from trigger center to bubble center when open.
const ARC_RADIUS = 130;

// Maximum links visible at once; swipe left/right to scroll the rest.
const MAX_VISIBLE = 4;



// ============================================================
// RADIAL SCROLL HOOK
// ============================================================
// Smooth continuous scroll: scrollPos is a float where each integer
// step advances one link.  Links slide continuously along the arc
// while dragging; on release they snap to the nearest integer.

function useRadialScroll(count) {
  const [scrollPos, setScrollPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Refs so touch handlers never go stale
  const touchStartX   = useRef(null);
  const scrollAtStart = useRef(0);
  const scrollPosRef  = useRef(0);

  // Keep ref in sync with state so handlers can read current value
  useEffect(() => { scrollPosRef.current = scrollPos; }, [scrollPos]);

  const onTouchStart = useCallback((e) => {
    touchStartX.current   = e.touches[0].clientX;
    scrollAtStart.current = scrollPosRef.current;
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;
    e.preventDefault(); // stop pull-to-refresh / page scroll
    // 70 px ≈ one link step — tune to taste
    const dx  = (touchStartX.current - e.touches[0].clientX) / 70;
    const raw = scrollAtStart.current + dx;
    const wrapped = ((raw % count) + count) % count;
    scrollPosRef.current = wrapped;
    setScrollPos(wrapped);
  }, [count]);

  // Expose onTouchMove via a ref so callers can register it as a
  // non-passive listener (required for preventDefault to work).
  const onTouchMoveRef = useRef(onTouchMove);
  useEffect(() => { onTouchMoveRef.current = onTouchMove; }, [onTouchMove]);

  const onTouchEnd = useCallback(() => {
    const snapped = ((Math.round(scrollPosRef.current) % count) + count) % count;
    scrollPosRef.current = snapped;
    setScrollPos(snapped);
    setIsDragging(false);
    touchStartX.current = null;
  }, [count]);

  return { scrollPos, isDragging, onTouchStart, onTouchMoveRef, onTouchEnd };
}

// ============================================================
// ARC POSITION UTILITY
// ============================================================
// Returns {tx, ty} for a continuous slot value (may be fractional).
//   slot 0 → leftmost position,  slot (maxVisible-1) → rightmost

function computeArcPosition(slot, maxVisible, radius, spanDeg) {
  const t = maxVisible > 1 ? slot / (maxVisible - 1) : 0.5;
  // Center the arc at 90° (directly above trigger) so both endpoints
  // are equally above the trigger: start = 90 + spanDeg/2, end = 90 - spanDeg/2.
  const startAngle = 90 + spanDeg / 2;
  const angleDeg = startAngle - t * spanDeg;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    tx: Math.cos(angleRad) * radius,
    ty: -Math.sin(angleRad) * radius,
  };
}

// ============================================================
// TRIGGER BUTTON
// ============================================================
// Circular glass button — cursor-following rim glow when closed,
// morphs hamburger → X when open.

const TriggerButton = ({ isOpen, onClick }) => {
  const ref = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setGlowPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
      style={{
        "--glow-x":    `${glowPos.x}%`,
        "--glow-y":    `${glowPos.y}%`,
        "--glow-show": !isOpen && hovered ? "1" : "0",
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
    >
      <span className={`${styles.bar} ${isOpen ? styles.barTopOpen : styles.barTop}`} aria-hidden="true" />
      <span className={`${styles.bar} ${isOpen ? styles.barMidOpen : styles.barMid}`} aria-hidden="true" />
      <span className={`${styles.bar} ${isOpen ? styles.barBotOpen : styles.barBot}`} aria-hidden="true" />
    </button>
  );
};

// ============================================================
// LINK BUBBLE
// ============================================================
// One navigation link rendered as a glass circle with an icon
// and an always-visible frosted label above it (like Settings).

const LinkBubble = ({ link, position, opacity, isDragging, isOpen, isActive, delay, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const ref = useRef(null);

  const Icon = useMemo(() => resolveIcon(link), [link]);

  const handleMouseMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setGlowPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  }, []);

  return (
    // Anchor centered on the trigger; translates to arc position when open.
    // flex-direction: column-reverse → label is visually ABOVE the bubble,
    // pointing further away from the trigger on an upward arc.
    <div
      className={`${styles.bubbleAnchor} ${isOpen ? styles.bubbleAnchorOpen : ""}`}
      style={{
        "--tx":    `${position.tx}px`,
        "--ty":    `${position.ty}px`,
        "--delay": isDragging ? "0s" : `${delay}s`,
        opacity,
        ...(isDragging ? { transition: "none" } : {}),
      }}
      aria-hidden={!isOpen}
    >
      {/* Label — always rendered, fades in with the anchor */}
      <span className={styles.bubbleLabel} aria-hidden="true">
        {link.label}
      </span>

      <button
        ref={ref}
        type="button"
        className={[
          styles.bubble,
          isActive ? styles.bubbleActive  : "",
          hovered  ? styles.bubbleHovered : "",
        ].filter(Boolean).join(" ")}
        style={{
          "--glow-x":    `${glowPos.x}%`,
          "--glow-y":    `${glowPos.y}%`,
          "--glow-show": hovered ? "1" : "0",
        }}
        onClick={() => isOpen && onClick(link)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        tabIndex={isOpen ? 0 : -1}
        aria-label={link.label}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon size={20} className={styles.bubbleIcon} />
      </button>
    </div>
  );
};



// ============================================================
// MOBILE NAV
// ============================================================

const MobileNav = ({ links = [], onNavigate, activeTab = null, triggerSize = 64 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const count = links.length;
  const { scrollPos, isDragging, onTouchStart, onTouchMoveRef, onTouchEnd } = useRadialScroll(count);

  // Attach touchmove as a non-passive listener so preventDefault() works,
  // preventing the browser pull-to-refresh and page scroll while swiping.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => onTouchMoveRef.current(e);
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, [onTouchMoveRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Compute each link's continuous arc position and fade opacity.
  // Links smoothly slide along the arc while dragging.
  const linkSlots = useMemo(() => {
    if (count === 0) return [];
    const maxV = Math.min(count, MAX_VISIBLE);
    const result = [];
    for (let i = 0; i < count; i++) {
      // Relative slot: how many positions away from the leftmost visible slot
      let relSlot = ((i - scrollPos) % count + count) % count;
      // Fold links that are outside the visible window to the left-fade edge.
      // Use maxV (not count/2) so that when count == maxV, all slots are shown
      // and none accidentally fold into a negative-ty (below-trigger) position.
      if (relSlot >= maxV) relSlot -= count;
      // Only render links that are within one slot of the visible window
      if (relSlot < -1 || relSlot > maxV) continue;
      // Fade: full opacity in [0, maxV-1], fades in/out over 0.7 slots at each edge
      const fadeIn  = Math.min(1, (relSlot + 0.7) / 0.7);
      const fadeOut = Math.min(1, (maxV - 0.3 - relSlot) / 0.7);
      const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
      if (opacity <= 0) continue;
      result.push({
        linkIndex: i,
        position: computeArcPosition(relSlot, maxV, ARC_RADIUS, ARC_SPAN),
        opacity,
        delay: 0.04 + Math.max(0, relSlot) * 0.06,
      });
    }
    return result;
  }, [scrollPos, count]);

  const { pathname } = useLocation();

  const isActive = (link, index) => {
    // Match by current pathname — exact for root, startsWith for others
    if (link.to) {
      if (link.to === "/") return pathname === "/";
      return pathname.startsWith(link.to);
    }
    // Fallback: prop-based match
    if (activeTab === null) return false;
    return activeTab === index;
  };

  const handleLinkClick = (link) => {
    const originalIndex = links.indexOf(link);
    if (link.onClick) link.onClick();
    if (link.to) onNavigate(link.to, originalIndex);
    setIsOpen(false);
  };

  return (
    <>
      {/* Full-screen backdrop — portalled to body so the parent container's
          CSS transform does not act as the containing block for position:fixed. */}
      {isOpen && createPortal(
        <div
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />,
        document.body
      )}

      <div
        ref={containerRef}
        className={styles.container}
        style={{ "--trigger-size": `${triggerSize}px` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
      {/* Arc link bubbles — slide smoothly along the arc while dragging */}
      {linkSlots.map(({ linkIndex, position, opacity, delay }) => {
        const link = links[linkIndex];
        if (!link) return null;
        return (
          <LinkBubble
            key={`mob-link-${linkIndex}`}
            link={link}
            position={position}
            opacity={opacity}
            isDragging={isDragging}
            isOpen={isOpen}
            isActive={isActive(link, linkIndex)}
            delay={delay}
            onClick={handleLinkClick}
          />
        );
      })}

      {/* Trigger */}
      <TriggerButton isOpen={isOpen} onClick={() => setIsOpen(v => !v)} />
    </div>
    </>
  );
};

export default MobileNav;
