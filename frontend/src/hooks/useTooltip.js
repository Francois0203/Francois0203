import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

import styles from '../components/Tooltip/Tooltip.module.css';

/* ─── PORTAL SURFACE ──────────────────────────────────────────────────────────
   Declared once, at module scope, so React sees one stable component type.
   Hidden at (0,0) until the first position is calculated, to avoid a flash. */
const TooltipSurface = ({
  isVisible, isExiting, isAnimatingIn, placement, position, surfaceRef, children,
}) => {
  if (!isVisible && !isExiting) return null;

  const tooltipClasses = [
    styles.tooltip,
    styles[placement],
    isAnimatingIn && !isExiting ? styles.visible : '',
    isExiting ? styles.exit : '',
  ].filter(Boolean).join(' ');

  return createPortal(
    <div
      ref={surfaceRef}
      className={tooltipClasses}
      style={{
        left: position.x,
        top: position.y,
        visibility: position.x === 0 && position.y === 0 ? 'hidden' : 'visible',
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

// ─── HOOK ────────────────────────────────────────────────────────────────────
// Manages tooltip visibility, animated entry/exit, and viewport-aware placement.
export const useTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [placement, setPlacement] = useState('right');
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // ─── POSITION CALCULATION ─────────────────────────────────────────────────
  // Tries right → left → bottom → top; clamps to viewport with 12px margin.
  const calculatePosition = useCallback((triggerElement) => {
    if (!triggerElement || !tooltipRef.current) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const tooltipElement = tooltipRef.current;
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12;

    let x, y, finalPlacement = 'right';

    if (triggerRect.right + margin + tooltipRect.width <= viewportWidth) {
      x = triggerRect.right + margin;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      finalPlacement = 'right';
    } else if (triggerRect.left - margin - tooltipRect.width >= 0) {
      x = triggerRect.left - margin - tooltipRect.width;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      finalPlacement = 'left';
    } else if (triggerRect.bottom + margin + tooltipRect.height <= viewportHeight) {
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.bottom + margin;
      finalPlacement = 'bottom';
    } else if (triggerRect.top - margin - tooltipRect.height >= 0) {
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.top - margin - tooltipRect.height;
      finalPlacement = 'top';
    } else {
      x = Math.min(triggerRect.right + margin, viewportWidth - tooltipRect.width - margin);
      y = Math.max(margin, Math.min(triggerRect.top, viewportHeight - tooltipRect.height - margin));
      finalPlacement = 'right';
    }

    x = Math.max(margin, Math.min(x, viewportWidth - tooltipRect.width - margin));
    y = Math.max(margin, Math.min(y, viewportHeight - tooltipRect.height - margin));

    setPosition({ x, y });
    setPlacement(finalPlacement);
  }, []);

  // ─── SHOW / HIDE ───────────────────────────────────────────────────────────
  const showTooltip = useCallback(() => {
    setIsExiting(false);
    setIsVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setIsAnimatingIn(false);
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
    }, 220);
  }, []);

  // ─── REPOSITION EFFECTS ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const frame = requestAnimationFrame(() => {
        calculatePosition(triggerRef.current);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return undefined;

    /*
     * Coalesced into one rAF and marked passive.
     *
     * calculatePosition does two getBoundingClientRect() reads and two
     * setState calls, and this was wired to `scroll` in the capture phase -
     * so it fired for scrolls on any element, unthrottled, forcing a
     * synchronous layout and a React render per scroll event for as long as
     * the tooltip was open. Capture is still needed (the trigger may sit in a
     * nested scroller), but one recalculation per frame is enough.
     */
    let frame = 0;
    const handleReposition = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (triggerRef.current) calculatePosition(triggerRef.current);
      });
    };

    window.addEventListener('resize', handleReposition, { passive: true });
    window.addEventListener('scroll', handleReposition, { capture: true, passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, { capture: true });
    };
  }, [isVisible, calculatePosition]);

  // ─── TRIGGER PROPS ──────────────────────────────────────────────────────────
  const triggerProps = {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  };

  // ─── PORTAL ──────────────────────────────────────────────────────────────
  /*
   * Bound to this hook's current state, but the component itself lives at
   * module scope (see TooltipSurface below).
   *
   * It used to be declared here, inside the hook body, which made it a NEW
   * component type on every render of whatever consumed the hook. React
   * compares types by identity, so it unmounted and remounted the entire
   * portal subtree on each consumer render instead of updating it - throwing
   * away the tooltip's DOM, and its running enter animation, mid-flight. That
   * is a correctness bug that happened to also cost frames.
   */
  const TooltipPortal = useCallback(
    ({ children }) => (
      <TooltipSurface
        isVisible={isVisible}
        isExiting={isExiting}
        isAnimatingIn={isAnimatingIn}
        placement={placement}
        position={position}
        surfaceRef={tooltipRef}
      >
        {children}
      </TooltipSurface>
    ),
    [isVisible, isExiting, isAnimatingIn, placement, position],
  );

  return {
    triggerProps,
    TooltipPortal,
    isVisible,
    placement,
  };
};

export default useTooltip;