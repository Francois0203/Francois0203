import { useEffect, useRef } from 'react';
import { markFor } from '../Stack/marks';
import styles from './Playground.module.css';

const TONES = ['blue', 'yellow', 'green', 'orange', 'pink'];

const still = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

const STEP = 1000 / 60;

// Load the physics library early, while the browser is idle.
let matterPromise = null;
const loadMatter = () => (matterPromise ??= import('matter-js').then(m => m.default));

// Tool pills that fall into a pile. Drag them, or tap to kick on phones.
const Playground = ({ items = [], caption }) => {
  const boxRef = useRef(null);
  const nodes = useRef([]);
  const list = items.slice(0, 18);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !list.length || still()) return undefined;

    let cancelled = false;
    let teardown = () => {};

    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const warm = idle(() => loadMatter());

    const start = async () => {
      const Matter = await loadMatter();
      if (cancelled) return;
      const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Sleeping } = Matter;

      const W = box.clientWidth;
      const H = box.clientHeight;
      const sizes = nodes.current.map(n => (n ? { w: n.offsetWidth, h: n.offsetHeight } : { w: 0, h: 0 }));
      const engine = Engine.create({ gravity: { y: 1.1 }, enableSleeping: true });
      const wall = { isStatic: true };

      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + 50, W * 3, 100, wall),
        Bodies.rectangle(-50, H / 2 - H, 100, H * 4, wall),
        Bodies.rectangle(W + 50, H / 2 - H, 100, H * 4, wall),
      ]);

      const bodies = sizes.map((s, i) => {
        const x = s.w / 2 + ((i * 0.618 * W) % Math.max(1, W - s.w));
        const y = -s.h * (1 + i * 1.2);
        const b = Bodies.rectangle(x, y, s.w, s.h, {
          chamfer: { radius: s.h / 2 - 1 },
          restitution: 0.3,
          friction: 0.4,
          frictionAir: 0.015,
          density: 0.0015,
        });
        Body.setAngle(b, (i % 2 ? 1 : -1) * (0.1 + (i % 5) * 0.08));
        return b;
      });
      Composite.add(engine.world, bodies);

      const place = (b, i) => {
        const n = nodes.current[i];
        if (!n) return;
        const x = (b.position.x - sizes[i].w / 2).toFixed(1);
        const y = (b.position.y - sizes[i].h / 2).toFixed(1);
        n.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${b.angle.toFixed(3)}rad)`;
      };

      // Place pills first, so none flash in the corner.
      bodies.forEach(place);
      box.dataset.live = '';

      const coarse = window.matchMedia('(pointer: coarse)').matches;
      let onTap = null;
      let unbindDrag = () => {};
      if (!coarse) {
        const mouse = Mouse.create(box);
        ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach(e => mouse.element.removeEventListener(e, mouse.mousewheel));
        const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
        Composite.add(engine.world, drag);
        Events.on(drag, 'startdrag', () => { box.dataset.grabbing = ''; });
        Events.on(drag, 'enddrag', () => { delete box.dataset.grabbing; });

        // Let go of a pill even when the mouse is released outside the box.
        const follow = (e) => { if (mouse.button === 0) mouse.mousemove(e); };
        const release = (e) => { if (mouse.button !== -1) mouse.mouseup(e); };
        const drop = () => { mouse.button = -1; };
        const onHidden = () => { if (document.hidden) drop(); };
        window.addEventListener('mousemove', follow, { passive: true });
        window.addEventListener('mouseup', release, { passive: true });
        window.addEventListener('blur', drop);
        document.addEventListener('visibilitychange', onHidden);
        unbindDrag = () => {
          window.removeEventListener('mousemove', follow);
          window.removeEventListener('mouseup', release);
          window.removeEventListener('blur', drop);
          document.removeEventListener('visibilitychange', onHidden);
        };
      } else {
        onTap = (e) => {
          const r = box.getBoundingClientRect();
          const tx = e.clientX - r.left;
          bodies.forEach(b => {
            Sleeping.set(b, false);
            const dir = Math.sign(b.position.x - tx) || 1;
            Body.setVelocity(b, { x: dir * (3 + Math.random() * 5), y: -9 - Math.random() * 7 });
            Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.25);
          });
        };
        box.addEventListener('pointerdown', onTap);
      }

      // Even steps keep it smooth. Pills at rest are skipped.
      let raf = 0;
      let last = performance.now();
      let carry = 0;
      const tick = (now) => {
        carry = Math.min(carry + now - last, STEP * 4);
        last = now;
        while (carry >= STEP) {
          Engine.update(engine, STEP);
          carry -= STEP;
        }
        bodies.forEach((b, i) => { if (!b.isSleeping) place(b, i); });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
        if (!e.isIntersecting) { cancelAnimationFrame(raf); raf = 0; }
      });
      io.observe(box);

      teardown = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        if (onTap) box.removeEventListener('pointerdown', onTap);
        unbindDrag();
        Engine.clear(engine);
      };
    };

    const gate = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      gate.disconnect();
      start();
    }, { rootMargin: '0px 0px -20% 0px' });
    gate.observe(box);

    return () => { cancelled = true; cancelIdle(warm); gate.disconnect(); teardown(); };
  }, [list.length]);

  if (!list.length) return null;

  return (
    <div className={styles.wrap}>
      {caption && <p className={styles.caption}>{caption}</p>}
      <div ref={boxRef} className={styles.pile} aria-hidden="true">
        {list.map((name, i) => {
          const Mark = markFor(name);
          return (
            <span
              key={name}
              ref={(el) => { nodes.current[i] = el; }}
              className={styles.piece}
              style={{ '--tone': `var(--c-${TONES[i % TONES.length]})` }}
            >
              <Mark className={styles.mark} />
              {name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Playground;
