import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

import styles from '../components/Tooltip/Tooltip.module.css';

export const useTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [placement, setPlacement] = useState('right');
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

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

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const frame = requestAnimationFrame(() => {
        calculatePosition(triggerRef.current);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const handleReposition = () => calculatePosition(triggerRef.current);
      window.addEventListener('resize', handleReposition);
      window.addEventListener('scroll', handleReposition, true);
      return () => {
        window.removeEventListener('resize', handleReposition);
        window.removeEventListener('scroll', handleReposition, true);
      };
    }
  }, [isVisible, calculatePosition]);

  const triggerProps = {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  };

  const TooltipPortal = ({ children }) => {
    if (!isVisible && !isExiting) return null;

    const tooltipClasses = [
      styles.tooltip,
      styles[placement],
      isAnimatingIn && !isExiting ? styles.visible : '',
      isExiting ? styles.exit : ''
    ].filter(Boolean).join(' ');

    return createPortal(
      <div
        ref={tooltipRef}
        className={tooltipClasses}
        style={{
          left: position.x,
          top: position.y,
          visibility: position.x === 0 && position.y === 0 ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>,
      document.body
    );
  };

  return {
    triggerProps,
    TooltipPortal,
    isVisible,
    placement,
  };
};

export default useTooltip;