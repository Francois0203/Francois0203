import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './CursorGlowButton.module.css';

/**
 * CursorGlowButton
 *
 * A "liquid glass" cursor-reactive button. Light flows across the surface
 * and subtly illuminates the border as the cursor moves.
 *
 * Layer stack (back → front):
 *   0. .glow span      — multi-layer radial glow, inset: -12px (bleeds past border)
 *   1. Glass base      — frosted background + backdrop-filter
 *   2. ::before        — reactive gradient border (CSS mask technique)
 *   3. ::after         — static diagonal glass sheen
 *   4. .content span   — text / children, always on top
 *
 * Cursor tracking uses requestAnimationFrame + linear interpolation for
 * smooth, fluid movement with no jitter.
 *
 * Props:
 *   children   — button label / content
 *   onClick    — click handler
 *   disabled   — disables the button
 *   type       — button type attribute (default: 'button')
 *   className  — additional class names
 *   ...rest    — any other native button attributes
 */

const LERP = 0.13;
const lerp = (a, b, t) => a + (b - a) * t;

const CursorGlowButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    className = '',
    ...rest
}) => {
    const buttonRef = useRef(null);
    const rafRef    = useRef(null);
    const targetRef  = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });
    const isHoveredRef = useRef(false);
    const [isHovered, setIsHovered] = useState(false);

    const applyPosition = useCallback((x, y) => {
        buttonRef.current?.style.setProperty('--glow-x', `${x}px`);
        buttonRef.current?.style.setProperty('--glow-y', `${y}px`);
    }, []);

    const animate = useCallback(() => {
        const cx = lerp(currentRef.current.x, targetRef.current.x, LERP);
        const cy = lerp(currentRef.current.y, targetRef.current.y, LERP);
        currentRef.current = { x: cx, y: cy };
        applyPosition(cx, cy);
        if (isHoveredRef.current) {
            rafRef.current = requestAnimationFrame(animate);
        }
    }, [applyPosition]);

    const handleMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        targetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const handleMouseEnter = useCallback((e) => {
        isHoveredRef.current = true;
        setIsHovered(true);
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Snap to entry point — no initial teleport lag
            currentRef.current = { x, y };
            targetRef.current  = { x, y };
            applyPosition(x, y);
        }
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
    }, [animate, applyPosition]);

    const handleMouseLeave = useCallback(() => {
        isHoveredRef.current = false;
        setIsHovered(false);
        cancelAnimationFrame(rafRef.current);
    }, []);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    return (
        <button
            ref={buttonRef}
            type={type}
            className={`${styles.button} ${className}`}
            disabled={disabled}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ '--glow-opacity': isHovered ? '1' : '0' }}
            {...rest}
        >
            {/* Outer bleed + surface glow — extends past button boundary */}
            <span className={styles.glow} aria-hidden="true" />
            <span className={styles.content}>{children}</span>
        </button>
    );
};

export default CursorGlowButton;
