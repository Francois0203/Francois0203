import styles from './LightWaveButton.module.css';

/**
 * A gradient that sweeps in from the left on hover and continues out through
 * the right on leave - it never reverses.
 *
 * That directionality is the whole point, and it is what the previous version
 * got wrong: it slid the fill in from the left and then back out to the left,
 * so the light appeared to change its mind. Light passing through glass carries
 * on in the direction it was going.
 *
 * Pure CSS. The trick is that `transform-origin` is not an animatable property
 * in this transition, so it snaps between states while `scaleX` interpolates -
 * see the module for the mechanics.
 */
const LightWaveButton = ({
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
    <span className={styles.fill} aria-hidden="true" />
    <span className={styles.content}>{children}</span>
  </button>
);

export default LightWaveButton;
