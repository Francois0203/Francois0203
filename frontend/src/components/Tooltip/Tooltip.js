import React from 'react';

/* Hooks */
import { useTooltip } from '../../hooks';

/* Styling */
import styles from './Tooltip.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * TOOLTIP COMPONENT
 * ============================================================================
 * Reusable tooltip with heading and content
 * Uses useTooltip hook for positioning and visibility
 * ============================================================================
 */

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
      {/* Trigger element */}
      <span
        {...triggerProps}
        className={`${styles.trigger} ${className}`}
        {...props}
      >
        {children}
      </span>

      {/* Tooltip box */}
      <TooltipPortal>
        {heading && (
          <span className={styles.heading}>{heading}</span>
        )}
        {content && (
          <span className={styles.body}>{content}</span>
        )}
      </TooltipPortal>
    </>
  );
};

export default Tooltip;