import { useCallback, useRef } from 'react';
import styles from './Button.module.css';

/*
 * The site's only button. Pills, because nothing else is round, so a pill
 * can only be a control.
 *
 * The fill sweeps in from the edge the pointer crossed. The origin goes
 * straight to the node as a custom property: through state it would be a
 * render per sample.
 */
const Button = ({
  as: Tag = 'button',
  variant = 'line',
  size = 'md',
  className = '',
  children,
  onPointerEnter,
  ...rest
}) => {
  const ref = useRef(null);

  const handleEnter = useCallback((event) => {
    const node = ref.current;
    if (node) {
      const box = node.getBoundingClientRect();
      node.style.setProperty('--ox', `${((event.clientX - box.left) / box.width) * 100}%`);
      node.style.setProperty('--oy', `${((event.clientY - box.top) / box.height) * 100}%`);
    }
    onPointerEnter?.(event);
  }, [onPointerEnter]);

  return (
    <Tag
      ref={ref}
      className={[styles.btn, styles[variant], size !== 'md' && styles[size], className]
        .filter(Boolean).join(' ')}
      onPointerEnter={handleEnter}
      {...(Tag === 'button' && !rest.type ? { type: 'button' } : null)}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
    </Tag>
  );
};

export default Button;
