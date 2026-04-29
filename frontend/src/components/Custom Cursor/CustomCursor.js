import { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './CustomCursor.module.css';

// Lerp factor — exponential smoothing, mathematically can never overshoot.
// 0.25 = slight fluid trail; increase toward 1.0 for a snappier follow.
const LERP        = 0.28;
const INTERACTIVE = 'button, a, [role="button"], input, select, textarea, label';

const CustomCursor = () => {
    const wrapperRef    = useRef(null);
    const targetRef     = useRef({ x: -200, y: -200 });
    const posRef        = useRef({ x: -200, y: -200 });
    const isPointerRef  = useRef(false);
    const isClickingRef = useRef(false);
    const rafRef        = useRef(null);

    const tick = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (wrapper) {
            const pos = posRef.current;
            const t   = targetRef.current;

            // Exponential lerp — smooth, zero overshoot, zero jiggle
            const prevX = pos.x;
            const prevY = pos.y;
            pos.x += (t.x - pos.x) * LERP;
            pos.y += (t.y - pos.y) * LERP;

            // True per-frame velocity (after lerp) for barely-there stretch
            const vx = pos.x - prevX;
            const vy = pos.y - prevY;
            const sx = 1 + Math.min(Math.abs(vx) * 0.006, 0.05);
            const sy = 1 + Math.min(Math.abs(vy) * 0.006, 0.05);

            const extra = isClickingRef.current ? 0.82 : (isPointerRef.current ? 1.18 : 1.0);

            // Offset so the visual tip (3,3) lands at the real mouse position
            wrapper.style.transform =
                `translate(${pos.x - 3}px, ${pos.y - 3}px) scaleX(${sx * extra}) scaleY(${sy * extra})`;
        }

        rafRef.current = requestAnimationFrame(tick);
    }, []);

    // Hide system cursor site-wide
    useEffect(() => {
        document.body.classList.add('custom-cursor-active');
        return () => document.body.classList.remove('custom-cursor-active');
    }, []);

    useEffect(() => {
        const onMove = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };

            const isPtr = !!e.target.closest(INTERACTIVE);
            if (isPtr !== isPointerRef.current) {
                isPointerRef.current = isPtr;
                wrapperRef.current?.classList.toggle(styles.isPointer, isPtr);
            }
        };

        const onDown  = () => { isClickingRef.current = true; };
        const onUp    = () => { isClickingRef.current = false; };
        const onLeave = () => { if (wrapperRef.current) wrapperRef.current.style.opacity = '0'; };
        const onEnter = () => { if (wrapperRef.current) wrapperRef.current.style.opacity = '1'; };

        window.addEventListener('mousemove',    onMove,  { passive: true });
        window.addEventListener('mousedown',    onDown);
        window.addEventListener('mouseup',      onUp);
        document.addEventListener('mouseleave', onLeave);
        document.addEventListener('mouseenter', onEnter);

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('mousemove',    onMove);
            window.removeEventListener('mousedown',    onDown);
            window.removeEventListener('mouseup',      onUp);
            document.removeEventListener('mouseleave', onLeave);
            document.removeEventListener('mouseenter', onEnter);
            cancelAnimationFrame(rafRef.current);
        };
    }, [tick]);

    return createPortal(
        <div ref={wrapperRef} className={styles.cursorWrapper} aria-hidden="true">
            <div className={styles.cursorArrow}>
                <span className={styles.sheen} />
            </div>
            {/* SVG border — not clipped, traces the triangle with a sharp stroke */}
            <svg
                className={styles.cursorBorder}
                viewBox="0 0 30 30"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <polygon points="3,3 3,27 27,27" />
            </svg>
        </div>,
        document.body
    );
};

export default CustomCursor;
