import styles from './GlowBorderButton.module.css';

/**
 * A single point of light travelling continuously around the button's border.
 *
 * Pure CSS, and deliberately so. The obvious implementation animates an
 * `@property --angle` inside a conic-gradient, which forces the browser to
 * rebuild the gradient on the main thread every frame. This one puts a static
 * conic gradient on an oversized square and spins the square with `transform`,
 * so the whole effect lives on the compositor and costs nothing while it runs.
 *
 * @param {'glass'|'solid'} [tone='glass'] - `glass` for a translucent surface
 *        the border reads against; `solid` for a filled accent surface, when
 *        this is the one primary action on the view.
 */
const GlowBorderButton = ({
  children,
  onClick,
  disabled,
  tone = 'glass',
  type = 'button',
  className = '',
  ...rest
}) => (
  <button
    type={type}
    className={`${styles.button} ${styles[tone]} ${className}`}
    disabled={disabled}
    onClick={onClick}
    {...rest}
  >
    {/* Two rings, not one: .track is the travelling light, .rim is a constant
        hairline underneath it. Without the rim the button visibly loses its
        outline wherever the light is not, which reads as a rendering fault. */}
    <span className={styles.rim} aria-hidden="true" />
    <span className={styles.track} aria-hidden="true">
      <span className={styles.spinner} />
    </span>
    <span className={styles.content}>{children}</span>
  </button>
);

export default GlowBorderButton;
