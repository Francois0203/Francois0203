import { useEffect, useRef } from 'react';
import { markFor } from '../Stack/marks';
import styles from './Playground.module.css';

const TONES = ['blue', 'yellow', 'green', 'orange', 'pink'];

const still = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

// His tools as sticker pills that fall into a heap: drag them on desktop, tap to kick on touch.
const Playground = ({ items = [], caption }) => {
  const boxRef = useRef(null);
  const nodes = useRef([]);
  const list = items.slice(0, 18);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !list.length || still()) return undefined;

    let cancelled = false;
    let teardown = () => {};

    const start = async () => {
      const Matter = (await import('matter-js')).default;
      if (cancelled) return;
      const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;

      const W = box.clientWidth;
      const H = box.clientHeight;
      const sizes = nodes.current.map(n => (n ? { w: n.offsetWidth, h: n.offsetHeight } : { w: 0, h: 0 }));
      const engine = Engine.create({ gravity: { y: 1.1 } });
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

        // Matter only hears the box, so a release outside it never ended the drag.
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
            const dir = Math.sign(b.position.x - tx) || 1;
            Body.setVelocity(b, { x: dir * (3 + Math.random() * 5), y: -9 - Math.random() * 7 });
            Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.25);
          });
        };
        box.addEventListener('pointerdown', onTap);
      }

      let raf = 0;
      let last = performance.now();
      const tick = (now) => {
        Engine.update(engine, Math.min(32, now - last));
        last = now;
        bodies.forEach((b, i) => {
          const n = nodes.current[i];
          if (n) n.style.transform = `translate(${b.position.x - sizes[i].w / 2}px, ${b.position.y - sizes[i].h / 2}px) rotate(${b.angle}rad)`;
        });
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

    return () => { cancelled = true; gate.disconnect(); teardown(); };
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
