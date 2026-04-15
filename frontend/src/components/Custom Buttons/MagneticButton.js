import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './MagneticButton.module.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// Magnetic button with cursor-proximity particle effect.
// Interaction layers: proximity particles → magnetic pull on hover → spring-back on leave.
// Particle canvas portalled to <body> to escape backdrop-filter stacking contexts.

const PROXIMITY_RADIUS = 110; // px from button center — particles activate below this
const PARTICLE_COUNT   = 6;   // initial burst per proximity entry
const LERP_FACTOR      = 0.10; // magnetic pull smoothing

const lerp = (a, b, t) => a + (b - a) * t;

// ─── PARTICLE FACTORY ─────────────────────────────────────────────────────────
// Spawns near the cursor with wide scatter; drifts toward a random interior
// point with an orbital wobble for organic, non-linear motion.
const createParticle = (btnRect, spawnX, spawnY) => {
    const angle  = Math.random() * Math.PI * 2;
    const radius = 4 + Math.random() * 22; // 4–26px scatter from cursor
    return {
        // Starts near cursor, drifts toward a random interior offset
        x: spawnX + Math.cos(angle) * radius,
        y: spawnY + Math.sin(angle) * radius,
        // Per-particle target offset — prevents pile-up at a single point
        targetOffsetX: (Math.random() - 0.5) * (btnRect.width  * 0.6),
        targetOffsetY: (Math.random() - 0.5) * (btnRect.height * 0.6),
        size:        1.2 + Math.random() * 1.6,
        opacity:     0,
        maxOpacity:  0.30 + Math.random() * 0.30,
        speed:       0.008 + Math.random() * 0.016, // staggered drift
        driftAngle:  Math.random() * Math.PI * 2,
        driftSpeed:  (Math.random() - 0.5) * 0.04,
        driftRadius: 2 + Math.random() * 5,         // px orbital wobble
        phase:       'fadein',
        life:        0,
        maxLife:     70 + Math.floor(Math.random() * 80),
    };
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const MagneticButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    className = '',
    ...rest
}) => {
    const buttonRef     = useRef(null);
    const canvasRef     = useRef(null);
    const rafMagRef     = useRef(null);
    const rafPrtRef     = useRef(null);
    const particles     = useRef([]);
    const magCurrent    = useRef({ x: 0, y: 0 });
    const magTarget     = useRef({ x: 0, y: 0 });
    const isNearRef     = useRef(false);
    const isHoverRef    = useRef(false);
    const frameCountRef = useRef(0);
    const cursorPosRef  = useRef({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // ─── CANVAS SIZING ──────────────────────────────────────────────────────────
    // Canvas = proximity diameter; centred on the button in page coordinates.
    const positionCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const btn    = buttonRef.current;
        if (!canvas || !btn) return;
        const rect = btn.getBoundingClientRect();
        const d    = PROXIMITY_RADIUS * 2;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        canvas.width  = d;
        canvas.height = d;
        canvas.style.left = `${rect.left + scrollX + rect.width  / 2 - PROXIMITY_RADIUS}px`;
        canvas.style.top  = `${rect.top  + scrollY + rect.height / 2 - PROXIMITY_RADIUS}px`;
    }, []);

    // ─── PARTICLE DRAW LOOP ─────────────────────────────────────────────────────────
    const drawParticles = useCallback(() => {
        const canvas = canvasRef.current;
        const btn    = buttonRef.current;
        if (!canvas || !btn) return;

        const ctx  = canvas.getContext('2d');
        const rect = btn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const d    = PROXIMITY_RADIUS * 2;

        ctx.clearRect(0, 0, d, d);

        // Trickle new particles while cursor is in proximity
        frameCountRef.current++;
        if (isNearRef.current && frameCountRef.current % 30 === 0) {
            particles.current.push(createParticle(rect, cursorPosRef.current.x, cursorPosRef.current.y));
        }

        // Canvas-local centre
        const lx = PROXIMITY_RADIUS;
        const ly = PROXIMITY_RADIUS;

        let anyAlive = false;

        particles.current = particles.current.filter((p) => {
            p.life++;

            // Drift toward personal target offset + slow orbital wobble
            p.driftAngle += p.driftSpeed;
            const targetX = cx + p.targetOffsetX + Math.cos(p.driftAngle) * p.driftRadius;
            const targetY = cy + p.targetOffsetY + Math.sin(p.driftAngle) * p.driftRadius;
            p.x = lerp(p.x, targetX, p.speed);
            p.y = lerp(p.y, targetY, p.speed);

            // Fade lifecycle
            if (p.phase === 'fadein') {
                p.opacity = Math.min(p.maxOpacity, p.opacity + 0.025);
                if (p.opacity >= p.maxOpacity) p.phase = 'hold';
            } else if (p.phase === 'hold') {
                if (p.life > p.maxLife * 0.6) p.phase = 'fadeout';
            } else {
                p.opacity = Math.max(0, p.opacity - 0.018);
                if (p.opacity <= 0) return false; // remove
            }

            // Convert world → canvas-local coords
            const px = (p.x - cx) + lx;
            const py = (p.y - cy) + ly;

            // Read accent colour from CSS custom property (set once per proximity entry)
            const rgb  = canvas.dataset.accentRgb || '45, 212, 191';
            const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2.5);
            grad.addColorStop(0, `rgba(${rgb}, ${p.opacity})`);
            grad.addColorStop(1, `rgba(${rgb}, 0)`);

            ctx.beginPath();
            ctx.arc(px, py, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            anyAlive = true;
            return true;
        });

        if (anyAlive || isNearRef.current) {
            rafPrtRef.current = requestAnimationFrame(drawParticles);
        } else {
            ctx.clearRect(0, 0, d, d);
        }
    }, []);

    // ─── MAGNETIC RAF LOOP ─────────────────────────────────────────────────────────
    const animateMag = useCallback(() => {
        const btn = buttonRef.current;
        if (!btn) return;
        const cx = lerp(magCurrent.current.x, magTarget.current.x, LERP_FACTOR);
        const cy = lerp(magCurrent.current.y, magTarget.current.y, LERP_FACTOR);
        magCurrent.current = { x: cx, y: cy };
        btn.style.setProperty('--mag-x', `${cx}px`);
        btn.style.setProperty('--mag-y', `${cy}px`);
        if (isHoverRef.current) rafMagRef.current = requestAnimationFrame(animateMag);
    }, []);

    // ─── PROXIMITY LISTENER ───────────────────────────────────────────────────────
    // Window-level — detects cursor entering/leaving the proximity field.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Sync accent-rgb for canvas drawing (reads CSS custom property)
        const syncAccentRgb = () => {
            const raw = getComputedStyle(document.documentElement)
                .getPropertyValue('--accent-1-rgb').trim();
            if (raw && canvas) canvas.dataset.accentRgb = raw;
        };
        syncAccentRgb();

        const onMouseMove = (e) => {
            const btn = buttonRef.current;
            if (!btn || disabled) return;

            const rect = btn.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

            cursorPosRef.current = { x: e.clientX, y: e.clientY };

            const wasNear = isNearRef.current;
            isNearRef.current = dist < PROXIMITY_RADIUS;

            if (isNearRef.current && !wasNear) {
                // Entered proximity — seed initial burst at cursor
                positionCanvas();
                syncAccentRgb();
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    particles.current.push(createParticle(rect, e.clientX, e.clientY));
                }
                cancelAnimationFrame(rafPrtRef.current);
                rafPrtRef.current = requestAnimationFrame(drawParticles);
            } else if (!isNearRef.current && wasNear) {
                // Left proximity — existing particles fade out naturally
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(rafPrtRef.current);
        };
    }, [disabled, positionCanvas, drawParticles]);

    // ── Button-level magnetic handlers ─────────────────────────────────────
    const handleMouseMove = useCallback((e) => {
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width  - 0.5;
        const ny = (e.clientY - rect.top)  / rect.height - 0.5;
        magTarget.current = { x: nx * 16, y: ny * 10 }; // ±8px X, ±5px Y
        // Track cursor for reactive glass border glow
        btn.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        btn.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
    }, []);

    const handleMouseEnter = useCallback(() => {
        isHoverRef.current = true;
        setIsHovered(true);
        buttonRef.current?.style.setProperty('--glow-opacity', '1');
        cancelAnimationFrame(rafMagRef.current);
        rafMagRef.current = requestAnimationFrame(animateMag);
    }, [animateMag]);

    const handleMouseLeave = useCallback(() => {
        isHoverRef.current = false;
        setIsHovered(false);
        buttonRef.current?.style.setProperty('--glow-opacity', '0');
        magTarget.current  = { x: 0, y: 0 };
        // CSS transition handles spring-back; reset synchronously
        cancelAnimationFrame(rafMagRef.current);
        magCurrent.current = { x: 0, y: 0 };
        buttonRef.current?.style.setProperty('--mag-x', '0px');
        buttonRef.current?.style.setProperty('--mag-y', '0px');
    }, []);

    // ─── CLEANUP ──────────────────────────────────────────────────────────────
    useEffect(() => () => {
        cancelAnimationFrame(rafMagRef.current);
        cancelAnimationFrame(rafPrtRef.current);
    }, []);
    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* Particle canvas — portaled to body to escape backdrop-filter stacking contexts */}
            {createPortal(
                <canvas
                    ref={canvasRef}
                    className={styles.particleCanvas}
                    aria-hidden="true"
                />,
                document.body
            )}
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
        </>
    );
};

export default MagneticButton;
