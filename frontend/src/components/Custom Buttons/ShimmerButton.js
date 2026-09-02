import styles from './ShimmerButton.module.css';

/**
 * The primary call to action: a solid accent button with a narrow band of light
 * that passes across the fill once, on hover.
 *
 * This replaces MagneticButton. Cursor-following was the wrong instinct for a
 * primary action - the button most likely to be clicked was the one that moved
 * away from the pointer aiming at it, and the label drifting inside the surface
 * made the whole control read as unstable. The shimmer gives the same "this one
 * is alive" signal without the button leaving its layout slot.
 *
 * No JavaScript. No pointer handlers, no RAF loop, no re-renders.
 */
const ShimmerButton = ({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  ...rest
}) => (
  <button
    type={type}
    className={`${styles.button} ${className}`}
    disabled={disabled}
    onClick={onClick}
    {...rest}
  >
    <span className={styles.sheen} aria-hidden="true" />
    <span className={styles.shimmer} aria-hidden="true" />
    <span className={styles.content}>{children}</span>
  </button>
);

export default ShimmerButton;
