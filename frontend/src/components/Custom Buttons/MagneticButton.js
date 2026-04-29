import { useRef, useState, useCallback, useEffect } from 'react';
import styles from './MagneticButton.module.css';

const LERP_FACTOR = 0.18;
const lerp = (a, b, t) => a + (b - a) * t;

const MagneticButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    className = '',
    ...rest
}) => {
    const buttonRef  = useRef(null);
    const rafRef     = useRef(null);
    const current    = useRef({ x: 0, y: 0 });
    const target     = useRef({ x: 0, y: 0 });
    const isHoverRef = useRef(false);
    const [isHovered, setIsHovered] = useState(false);

    const animateMag = useCallback(() => {
        const btn = buttonRef.current;
        if (!btn) return;
        const cx = lerp(current.current.x, target.current.x, LERP_FACTOR);
        const cy = lerp(current.current.y, target.current.y, LERP_FACTOR);
        current.current = { x: cx, y: cy };
        btn.style.setProperty('--mag-x', `${cx}px`);
        btn.style.setProperty('--mag-y', `${cy}px`);
        // Inner content moves 1.4× for parallax depth
        btn.style.setProperty('--inner-x', `${cx * 1.4}px`);
        btn.style.setProperty('--inner-y', `${cy * 1.4}px`);
        if (isHoverRef.current) rafRef.current = requestAnimationFrame(animateMag);
    }, []);

    const handleMouseMove = useCallback((e) => {
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width  - 0.5;
        const ny = (e.clientY - rect.top)  / rect.height - 0.5;
        target.current = { x: nx * 65, y: ny * 48 };
        btn.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        btn.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
    }, []);

    const handleMouseEnter = useCallback(() => {
        isHoverRef.current = true;
        setIsHovered(true);
        buttonRef.current?.style.setProperty('--glow-opacity', '1');
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animateMag);
    }, [animateMag]);

    const handleMouseLeave = useCallback(() => {
        isHoverRef.current = false;
        setIsHovered(false);
        buttonRef.current?.style.setProperty('--glow-opacity', '0');
        target.current  = { x: 0, y: 0 };
        cancelAnimationFrame(rafRef.current);
        current.current = { x: 0, y: 0 };
        const btn = buttonRef.current;
        if (btn) {
            btn.style.setProperty('--mag-x',   '0px');
            btn.style.setProperty('--mag-y',   '0px');
            btn.style.setProperty('--inner-x', '0px');
            btn.style.setProperty('--inner-y', '0px');
        }
    }, []);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    return (
        <button
            ref={buttonRef}
            type={type}
            className={`${styles.button} ${isHovered ? styles.hovered : ''} ${className}`}
            disabled={disabled}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...rest}
        >
            <span className={styles.sheen}       aria-hidden="true" />
            <span className={styles.surfaceGlow} aria-hidden="true" />
            <span className={styles.content}>{children}</span>
        </button>
    );
};

export default MagneticButton;
