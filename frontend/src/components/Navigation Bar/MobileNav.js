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

// ─── ICON MAP ────────────────────────────────────────────────────────────────
// Matches link label (lowercase) to a Lucide icon. link.icon prop takes priority.

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

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

// Full arc angle (deg), centred at 90° (directly above trigger)
const ARC_SPAN   = 120;
// Radius (px) from trigger center to bubble center when open
const ARC_RADIUS = 130;
// Max bubbles visible at once; swipe to scroll the rest
const MAX_VISIBLE = 4;

// ─── RADIAL SCROLL HOOK ─────────────────────────────────────────────────────────
// scrollPos floats where each integer = one link.
// Links slide continuously while dragging; snap to integer on release.

function useRadialScroll(count) {
  const [scrollPos, setScrollPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Refs so touch handlers never go stale
  const touchStartX   = useRef(null);
  const scrollAtStart = useRef(0);
  const scrollPosRef  = useRef(0);

  // Keep ref in sync — handlers read current value without going stale
  useEffect(() => { scrollPosRef.current = scrollPos; }, [scrollPos]);

  const onTouchStart = useCallback((e) => {
    touchStartX.current   = e.touches[0].clientX;
    scrollAtStart.current = scrollPosRef.current;
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;
    e.preventDefault(); // prevent pull-to-refresh / page scroll
    // 70px ≈ one link step
    const dx  = (touchStartX.current - e.touches[0].clientX) / 70;
    const raw = scrollAtStart.current + dx;
    const wrapped = ((raw % count) + count) % count;
    scrollPosRef.current = wrapped;
    setScrollPos(wrapped);
  }, [count]);

  // Expose via ref so callers can register as non-passive (required for preventDefault)
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

// ─── ARC POSITION UTILITY ─────────────────────────────────────────────────────────
// Returns {tx, ty} for a continuous slot value (may be fractional).
// slot 0 → leftmost, slot (maxVisible - 1) → rightmost.

function computeArcPosition(slot, maxVisible, radius, spanDeg) {
  const t          = maxVisible > 1 ? slot / (maxVisible - 1) : 0.5;
  // Arc centred at 90° (directly above trigger) — both endpoints equally above
  const startAngle = 90 + spanDeg / 2;
  const angleDeg   = startAngle - t * spanDeg;
  const angleRad   = (angleDeg * Math.PI) / 180;
  return {
    tx: Math.cos(angleRad) * radius,
    ty: -Math.sin(angleRad) * radius,
  };
}

// ─── TRIGGER BUTTON ───────────────────────────────────────────────────────────────
// Circular glass button with cursor rim glow. Hamburger morphs to ✕ when open.

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

// ─── LINK BUBBLE ────────────────────────────────────────────────────────────────
// Glass circle with icon + frosted label. Translates to arc position when open.

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
    // flex-direction: column-reverse → label sits visually above the bubble
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



// ─── MOBILE NAV ─────────────────────────────────────────────────────────────────

const MobileNav = ({ links = [], onNavigate, activeTab = null, triggerSize = 64 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const count = links.length;
  const { scrollPos, isDragging, onTouchStart, onTouchMoveRef, onTouchEnd } = useRadialScroll(count);

  // ─── TOUCH SETUP ──────────────────────────────────────────────────────────
  // Attach as non-passive so preventDefault() blocks pull-to-refresh.

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => onTouchMoveRef.current(e);
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, [onTouchMoveRef]);

  // ─── CLOSE HANDLERS ───────────────────────────────────────────────────────

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

  // ─── ARC LAYOUT ──────────────────────────────────────────────────────────────
  // Fractional slots allow smooth continuous sliding while dragging.

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
      if (relSlot < -1 || relSlot > maxV) continue;
      // Fade over 0.7 slots at each edge of the visible window
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

  // ─── ACTIVE DETECTION ───────────────────────────────────────────────────────

  const { pathname } = useLocation();

  const isActive = (link, index) => {
    // Match by pathname — exact for root, startsWith for others
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

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Full-screen backdrop — portalled to body to avoid CSS transform containment */}
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
