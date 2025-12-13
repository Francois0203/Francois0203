import React from 'react';

/* Hooks */
import { useTooltip } from '../../hooks';

/* Styling */
import styles from './Tooltip.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

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