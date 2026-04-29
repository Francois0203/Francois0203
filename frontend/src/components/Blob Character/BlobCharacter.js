import { useRef, useEffect, useCallback } from 'react';
import styles from './BlobCharacter.module.css';

const MAX_TRAVEL = 9;
const LERP_EYES  = 0.12;

const lerp = (a, b, t) => a + (b - a) * t;

const getPupilTarget = (eyeEl, mx, my) => {
    const r  = eyeEl.getBoundingClientRect();
    const ex = r.left + r.width  / 2;
    const ey = r.top  + r.height / 2;
    const dx = mx - ex;
    const dy = my - ey;
    const d  = Math.min(Math.hypot(dx, dy), MAX_TRAVEL);
    const a  = Math.atan2(dy, dx);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
};

const BlobCharacter = ({ className = '', style }) => {
    const blobRef       = useRef(null);
    const leftEyeRef    = useRef(null);
    const rightEyeRef   = useRef(null);
    const leftPupilRef  = useRef(null);
    const rightPupilRef = useRef(null);
    const cursorPosRef  = useRef({ x: -100, y: -100 });
    const leftPos       = useRef({ x: 0, y: 0 });
    const rightPos      = useRef({ x: 0, y: 0 });
    const rafRef        = useRef(null);

    const tick = useCallback(() => {
        const lE = leftEyeRef.current;
        const rE = rightEyeRef.current;
        const lP = leftPupilRef.current;
        const rP = rightPupilRef.current;
        const { x: mx, y: my } = cursorPosRef.current;

        if (lE && rE && lP && rP) {
            const lt = getPupilTarget(lE, mx, my);
            const rt = getPupilTarget(rE, mx, my);
            leftPos.current.x  = lerp(leftPos.current.x,  lt.x, LERP_EYES);
            leftPos.current.y  = lerp(leftPos.current.y,  lt.y, LERP_EYES);
            rightPos.current.x = lerp(rightPos.current.x, rt.x, LERP_EYES);
            rightPos.current.y = lerp(rightPos.current.y, rt.y, LERP_EYES);
            lP.style.transform = `translate(${leftPos.current.x}px, ${leftPos.current.y}px)`;
            rP.style.transform = `translate(${rightPos.current.x}px, ${rightPos.current.y}px)`;
        }

        rafRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        const onMove = (e) => {
            cursorPosRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, [tick]);

    const handleMouseMove = useCallback((e) => {
        const blob = blobRef.current;
        if (!blob) return;
        const rect = blob.getBoundingClientRect();
        blob.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        blob.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
    }, []);

    const handleMouseEnter = useCallback(() => {
        blobRef.current?.style.setProperty('--glow-opacity', '1');
    }, []);

    const handleMouseLeave = useCallback(() => {
        blobRef.current?.style.setProperty('--glow-opacity', '0');
    }, []);

    return (
        <div
            ref={blobRef}
            className={`${styles.blob} ${className}`}
            style={style}
            aria-hidden="true"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={styles.sheen} />
            <span className={styles.rimLight} />
            <span className={styles.surfaceGlow} />
            <div className={styles.eyes}>
                <div ref={leftEyeRef} className={styles.eye}>
                    <div ref={leftPupilRef} className={styles.pupil}>
                        <span className={styles.highlight} />
                        <span className={styles.highlightSmall} />
                    </div>
                </div>
                <div ref={rightEyeRef} className={styles.eye}>
                    <div ref={rightPupilRef} className={styles.pupil}>
                        <span className={styles.highlight} />
                        <span className={styles.highlightSmall} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlobCharacter;
