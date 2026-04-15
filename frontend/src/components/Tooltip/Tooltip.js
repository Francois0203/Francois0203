import React from 'react';
import { useTooltip } from '../../hooks';
import styles from './Tooltip.module.css';

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Optional heading + body tooltip, positioned and portalled via useTooltip.

const Tooltip = ({
  children,
  content,
  heading,
  className = '',
  ...props
}) => {
  const { triggerProps, TooltipPortal } = useTooltip();

  return (
    <>
      <span
        {...triggerProps}
        className={`${styles.trigger} ${className}`}
        {...props}
      >
        {children}
      </span>
      <TooltipPortal>
        {heading && <span className={styles.heading}>{heading}</span>}
        {content && <span className={styles.body}>{content}</span>}
      </TooltipPortal>
    </>
  );
};

export default Tooltip;