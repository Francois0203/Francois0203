import { useEffect, useRef } from 'react';
import { markFor } from '../Stack/marks';
import styles from './Playground.module.css';

const TONES = ['blue', 'green', 'orange', 'pink', 'yellow'];
const STEP = 1000 / 60;
const MAX_SPEED = 22;
const REACH = 110;

const still = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

let matterPromise = null;
const loadMatter = () => (matterPromise ??= import('matter-js').then(m => m.default));

// Where each group's hub sits: a row on wide screens, a two by two grid on narrow ones.
const anchorsFor = (n, W, H) => {
  if (W < 640) {
    const cols = 2;
    const rows = Math.ceil(n / cols);
    return Array.from({ length: n }, (_, i) => ({
      x: W * ((i % cols) + 0.5) / cols,
      y: H * (Math.floor(i / cols) + 0.5) / rows,
    }));
  }
  return Array.from({ length: n }, (_, i) => ({
    x: W * (i + 0.5) / n,
    y: H * (0.5 + (i % 2 ? 0.08 : -0.08)),
  }));
};

// Weightless tool groups. Each tool floats on an elastic tether to its group; push, fling or tap to scatter.
const Playground = ({ groups = [], caption }) => {
  const boxRef = useRef(null);
  const hubs = useRef([]);
  const pieces = useRef([]);
  const lines = useRef([]);

  const list = groups.filter(g => g.items?.length).map((g, gi) => ({
    ...g,
    tone: TONES[gi % TONES.length],
    items: g.items.slice(0, 9),
  }));
  const flat = list.flatMap((g, gi) => g.items.map(name => ({ name, gi })));
  const key = flat.map(f => f.name).join('|');

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !flat.length || still()) return undefined;

    let cancelled = false;
    let teardown = () => {};
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const warm = idle(() => loadMatter());

    const start = async () => {
      const Matter = await loadMatter();
      if (cancelled) return;
      const { Engine, Bodies, Body, Composite, Constraint, Mouse, MouseConstraint, Events, Sleeping } = Matter;

      box.dataset.live = '';
      const W = box.clientWidth;
      const H = box.clientHeight;
      const scale = Math.min(1, W / 1100);
      const anchors = anchorsFor(list.length, W, H);
      const engine = Engine.create({ gravity: { x: 0, y: 0 }, enableSleeping: true });
      const wall = { isStatic: true, restitution: 0.6 };

      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, -100, W + 400, 200, wall),
        Bodies.rectangle(W / 2, H + 100, W + 400, 200, wall),
        Bodies.rectangle(-100, H / 2, 200, H + 400, wall),
        Bodies.rectangle(W + 100, H / 2, 200, H + 400, wall),
      ]);

      hubs.current.forEach((n, gi) => {
        if (!n) return;
        const a = anchors[gi];
        n.style.transform = `translate3d(${(a.x - n.offsetWidth / 2).toFixed(1)}px, ${(a.y - n.offsetHeight / 2).toFixed(1)}px, 0)`;
        Composite.add(engine.world, Bodies.rectangle(a.x, a.y, n.offsetWidth, n.offsetHeight, { isStatic: true, chamfer: { radius: n.offsetHeight / 2 - 1 } }));
      });

      const sizes = pieces.current.map(n => (n ? { w: n.offsetWidth, h: n.offsetHeight } : { w: 0, h: 0 }));
      const bodies = flat.map((f, i) => {
        const a = anchors[f.gi];
        const k = list[f.gi].items.indexOf(f.name);
        const turn = (k / list[f.gi].items.length) * Math.PI * 2 + f.gi;
        const b = Bodies.rectangle(a.x + Math.cos(turn) * 4, a.y + Math.sin(turn) * 4, sizes[i].w, sizes[i].h, {
          chamfer: { radius: sizes[i].h / 2 - 1 },
          inertia: Infinity,
          frictionAir: 0.06,
          friction: 0.05,
          restitution: 0.5,
          density: 0.001,
        });
        b.home = a;
        b.turn = turn;
        Composite.add(engine.world, Constraint.create({
          pointA: { x: a.x, y: a.y },
          bodyB: b,
          length: (95 + (k % 3) * 30) * Math.max(0.6, scale),
          stiffness: 0.004,
          damping: 0.03,
          render: { visible: false },
        }));
        return b;
      });
      Composite.add(engine.world, bodies);

      // A burst outward on arrival, so the groups bloom open.
      bodies.forEach(b => Body.setVelocity(b, { x: Math.cos(b.turn) * 9, y: Math.sin(b.turn) * 9 }));

      const place = (b, i) => {
        const n = pieces.current[i];
        const l = lines.current[i];
        const { x, y } = b.position;
        if (n) n.style.transform = `translate3d(${(x - sizes[i].w / 2).toFixed(1)}px, ${(y - sizes[i].h / 2).toFixed(1)}px, 0)`;
        if (l) {
          l.setAttribute('x1', b.home.x.toFixed(1));
          l.setAttribute('y1', b.home.y.toFixed(1));
          l.setAttribute('x2', x.toFixed(1));
          l.setAttribute('y2', y.toFixed(1));
        }
      };
      bodies.forEach(place);

      const wake = () => bodies.forEach(b => Sleeping.set(b, false));
      let pointer = null;
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const at = (e) => { const r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      const onMove = (e) => { pointer = at(e); wake(); };
      const onLeave = () => { pointer = null; };
      box.addEventListener('pointermove', onMove, { passive: true });
      box.addEventListener('pointerleave', onLeave);

      let unbindDrag = () => {};
      let onTap = null;
      if (!coarse) {
        const mouse = Mouse.create(box);
        ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach(ev => mouse.element.removeEventListener(ev, mouse.mousewheel));
        const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.12, render: { visible: false } } });
        Composite.add(engine.world, drag);
        Events.on(drag, 'startdrag', () => { box.dataset.grabbing = ''; });
        Events.on(drag, 'enddrag', () => { delete box.dataset.grabbing; });
        const release = (e) => { if (mouse.button !== -1) mouse.mouseup(e); };
        const drop = () => { mouse.button = -1; };
        window.addEventListener('mouseup', release, { passive: true });
        window.addEventListener('blur', drop);
        unbindDrag = () => {
          window.removeEventListener('mouseup', release);
          window.removeEventListener('blur', drop);
        };
      } else {
        // A shockwave from the tap. Velocities add up to a cap and the tethers pull everything home.
        onTap = (e) => {
          const p = at(e);
          wake();
          bodies.forEach((b) => {
            const dx = b.position.x - p.x;
            const dy = b.position.y - p.y;
            const d = Math.hypot(dx, dy) || 1;
            const push = Math.max(0, 1 - d / 260) * 16;
            if (push) Body.setVelocity(b, { x: b.velocity.x + (dx / d) * push, y: b.velocity.y + (dy / d) * push });
          });
          box.style.setProperty('--wx', `${p.x}px`);
          box.style.setProperty('--wy', `${p.y}px`);
          box.removeAttribute('data-wave');
          void box.offsetWidth;
          box.setAttribute('data-wave', '');
        };
        box.addEventListener('pointerdown', onTap);
      }

      let raf = 0;
      let last = performance.now();
      let carry = 0;
      const tick = (now) => {
        carry = Math.min(carry + now - last, STEP * 4);
        last = now;
        if (pointer && !('grabbing' in box.dataset)) {
          bodies.forEach((b) => {
            const dx = b.position.x - pointer.x;
            const dy = b.position.y - pointer.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < REACH) Body.applyForce(b, b.position, { x: (dx / d) * (1 - d / REACH) * 0.012 * b.mass, y: (dy / d) * (1 - d / REACH) * 0.012 * b.mass });
          });
        }
        while (carry >= STEP) {
          Engine.update(engine, STEP);
          carry -= STEP;
        }
        bodies.forEach((b, i) => {
          const { x, y } = b.position;
          if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > W || y < 0 || y > H) {
            Body.setPosition(b, { x: b.home.x, y: b.home.y });
            Body.setVelocity(b, { x: 0, y: 0 });
          }
          const speed = Math.hypot(b.velocity.x, b.velocity.y);
          if (speed > MAX_SPEED) Body.setVelocity(b, { x: b.velocity.x / speed * MAX_SPEED, y: b.velocity.y / speed * MAX_SPEED });
          if (!b.isSleeping) place(b, i);
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
        box.removeEventListener('pointermove', onMove);
        box.removeEventListener('pointerleave', onLeave);
        if (onTap) box.removeEventListener('pointerdown', onTap);
        unbindDrag();
        Engine.clear(engine);
        delete box.dataset.live;
      };
    };

    const gate = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      gate.disconnect();
      start();
    }, { rootMargin: '0px 0px -20% 0px' });
    gate.observe(box);

    return () => { cancelled = true; cancelIdle(warm); gate.disconnect(); teardown(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!flat.length) return null;

  let i = -1;
  return (
    <div className={styles.wrap}>
      {caption && <p className={styles.caption}>{caption}</p>}
      <div ref={boxRef} className={styles.field} aria-hidden="true">
        <svg className={styles.lines}>
          {flat.map((f, k) => (
            <line key={f.name} ref={(el) => { lines.current[k] = el; }} style={{ '--tone': `var(--c-${list[f.gi].tone})` }} />
          ))}
        </svg>
        <span className={styles.wave} />
        {list.map((g, gi) => (
          <div key={g.name} className={styles.group} style={{ '--tone': `var(--c-${g.tone})` }}>
            <span ref={(el) => { hubs.current[gi] = el; }} className={styles.hub}>{g.name}</span>
            {g.items.map((name) => {
              i += 1;
              const k = i;
              const Mark = markFor(name);
              return (
                <span key={name} ref={(el) => { pieces.current[k] = el; }} className={styles.piece}>
                  <Mark className={styles.mark} />
                  {name}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playground;
