import styles from './LightWaveButton.module.css';

/**
 * LightWaveButton
 *
 * A premium light wave button with liquid-glass border and sliding accent fill.
 *
 * Layer stack (back → front):
 *   ::before  — sliding glass fill panel (left-to-right on hover)
 *              The leading edge carries a bright accent stripe that acts
 *              as a "sliding border highlight" moving through the perimeter
 *   ::after   — static diagonal sheen (ambient glass surface, always visible)
 *   .content  — text / children (z-index 2, always on top)
 *
 * No JS needed — pure CSS interaction.
 *
 * Props:
 *   children   — button label / content
 *   onClick    — click handler
 *   disabled   — disables the button
 *   type       — button type attribute (default: 'button')
 *   className  — additional class names
 *   ...rest    — any other native button attributes
 */
const LightWaveButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    className = '',
    ...rest
}) => {
    return (
        <button
            type={type}
            className={`${styles.button} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...rest}
        >
            <span className={styles.content}>{children}</span>
        </button>
    );
};

export default LightWaveButton;
