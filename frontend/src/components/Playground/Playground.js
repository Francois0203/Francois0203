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

const NARROW = 640;

// Wide screens: the hubs sit in a gentle zigzag row and tools hang on tethers around them.
const anchorsFor = (n, W, H) => Array.from({ length: n }, (_, i) => ({
  x: W * (i + 0.5) / n,
  y: H * (0.5 + (i % 2 ? 0.08 : -0.08)),
}));

// Narrow screens: one group per band, its tools in centred rows above and below the hub.
// Every tool gets its own measured slot, so nothing clips or overlaps at rest. Returns the height it needs.
const stackFor = (groups, sizes, hubSizes, W) => {
  const PAD = 16;
  const GAP = 8;
  const ROW = 10;
  const BAND = 30;
  const anchors = [];
  const slots = [];
  let y = PAD;
  let first = 0;
  groups.forEach((g, gi) => {
    const idx = g.items.map((_, k) => first + k);
    first += g.items.length;
    const rows = [];
    let row = [];
    let width = 0;
    idx.forEach((i) => {
      const w = sizes[i].w;
      if (row.length && width + GAP + w > W - PAD * 2) { rows.push(row); row = []; width = 0; }
      width += (row.length ? GAP : 0) + w;
      row.push(i);
    });
    if (row.length) rows.push(row);
    const ch = Math.max(...idx.map(i => sizes[i].h), 1);
    const lay = (r, cy) => {
      const total = r.reduce((sum, i) => sum + sizes[i].w, 0) + GAP * (r.length - 1);
      let x = (W - total) / 2;
      r.forEach((i) => { slots[i] = { x: x + sizes[i].w / 2, y: cy }; x += sizes[i].w + GAP; });
    };
    const above = Math.floor(rows.length / 2);
    rows.slice(0, above).forEach((r) => { lay(r, y + ch / 2); y += ch + ROW; });
    const hh = hubSizes[gi].h;
    y += 4;
    anchors[gi] = { x: W / 2, y: y + hh / 2 };
    y += hh + 4 + ROW;
    rows.slice(above).forEach((r) => { lay(r, y + ch / 2); y += ch + ROW; });
    y += BAND - ROW;
  });
  return { anchors, slots, H: Math.ceil(y - BAND + PAD) };
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
      const scale = Math.min(1, W / 1100);
      const sizes = pieces.current.map(n => (n ? { w: n.offsetWidth, h: n.offsetHeight } : { w: 0, h: 0 }));
      let H = box.clientHeight;
      let anchors;
      let slots = null;
      if (W < NARROW) {
        const hubSizes = list.map((_, gi) => ({ h: hubs.current[gi]?.offsetHeight ?? 0 }));
        ({ anchors, slots, H } = stackFor(list, sizes, hubSizes, W));
        box.style.height = `${H}px`;
      } else {
        box.style.height = '';
        anchors = anchorsFor(list.length, W, H);
      }
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

      const bodies = flat.map((f, i) => {
        const a = anchors[f.gi];
        const k = list[f.gi].items.indexOf(f.name);
        const turn = (k / list[f.gi].items.length) * Math.PI * 2 + f.gi;
        // On narrow screens each tool starts in its own slot and its spring holds it there; on wide ones it is a tether to the hub.
        const slot = slots?.[i];
        const from = slot ?? { x: a.x + Math.cos(turn) * 4, y: a.y + Math.sin(turn) * 4 };
        const b = Bodies.rectangle(from.x, from.y, sizes[i].w, sizes[i].h, {
          chamfer: { radius: sizes[i].h / 2 - 1 },
          inertia: Infinity,
          frictionAir: 0.06,
          friction: 0.05,
          restitution: 0.5,
          density: 0.001,
        });
        b.home = a;
        b.rest = slot ?? a;
        b.turn = turn;
        Composite.add(engine.world, Constraint.create({
          pointA: slot ? { x: slot.x, y: slot.y } : { x: a.x, y: a.y },
          bodyB: b,
          length: slot ? 0 : (95 + (k % 3) * 30) * Math.max(0.6, scale),
          stiffness: slot ? 0.008 : 0.004,
          damping: 0.03,
          render: { visible: false },
        }));
        return b;
      });
      Composite.add(engine.world, bodies);

      // A burst outward on arrival, so the groups bloom open.
      const puff = slots ? 3 : 9;
      bodies.forEach(b => Body.setVelocity(b, { x: Math.cos(b.turn) * puff, y: Math.sin(b.turn) * puff }));

      // Drawn between the last two physics steps, so fast screens glide instead of judder.
      const prev = bodies.map(b => ({ x: b.position.x, y: b.position.y }));
      const remember = () => bodies.forEach((b, i) => { prev[i].x = b.position.x; prev[i].y = b.position.y; });
      const drawn = bodies.map(() => '');
      const place = (b, i, k = 1) => {
        const x = prev[i].x + (b.position.x - prev[i].x) * k;
        const y = prev[i].y + (b.position.y - prev[i].y) * k;
        const key = `${x.toFixed(1)},${y.toFixed(1)}`;
        // Unchanged pieces are left alone: rewriting a line, even with the same value, relays the SVG.
        if (key === drawn[i]) return;
        drawn[i] = key;
        const n = pieces.current[i];
        const l = lines.current[i];
        if (n) n.style.transform = `translate3d(${(x - sizes[i].w / 2).toFixed(1)}px, ${(y - sizes[i].h / 2).toFixed(1)}px, 0)`;
        if (l) {
          if (!l.hasAttribute('x1')) {
            l.setAttribute('x1', b.home.x.toFixed(1));
            l.setAttribute('y1', b.home.y.toFixed(1));
          }
          l.setAttribute('x2', x.toFixed(1));
          l.setAttribute('y2', y.toFixed(1));
        }
      };
      bodies.forEach((b, i) => place(b, i));

      let resume = () => {};
      const wake = () => { bodies.forEach(b => Sleeping.set(b, false)); resume(); };
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
      let visible = true;
      let last = performance.now();
      let carry = 0;
      let grace = 30;
      const tick = (now) => {
        raf = 0;
        // A rAF stamp can be a touch older than the moment we woke, so never step backwards.
        carry = Math.max(0, Math.min(carry + now - last, STEP * 4));
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
          remember();
          Engine.update(engine, STEP);
          carry -= STEP;
        }
        bodies.forEach((b, i) => {
          const { x, y } = b.position;
          if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > W || y < 0 || y > H) {
            Body.setPosition(b, { x: b.rest.x, y: b.rest.y });
            Body.setVelocity(b, { x: 0, y: 0 });
            prev[i].x = b.rest.x; prev[i].y = b.rest.y;
          }
          const speed = Math.hypot(b.velocity.x, b.velocity.y);
          if (speed > MAX_SPEED) Body.setVelocity(b, { x: b.velocity.x / speed * MAX_SPEED, y: b.velocity.y / speed * MAX_SPEED });
          place(b, i, carry / STEP);
        });
        // Everything asleep and no pointer about: stop the loop until something stirs.
        if (!pointer && !('grabbing' in box.dataset) && bodies.every(b => b.isSleeping) && grace <= 0) return;
        if (grace > 0) grace -= 1;
        if (visible) raf = requestAnimationFrame(tick);
      };
      resume = () => {
        // Run a short while after any touch, so a grab or tap always reaches the physics before it can pause.
        grace = 30;
        if (raf || !visible) return;
        last = performance.now();
        carry = 0;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      box.addEventListener('pointerdown', resume);

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) resume();
        else { cancelAnimationFrame(raf); raf = 0; }
      });
      io.observe(box);

      teardown = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        box.removeEventListener('pointermove', onMove);
        box.removeEventListener('pointerleave', onLeave);
        box.removeEventListener('pointerdown', resume);
        if (onTap) box.removeEventListener('pointerdown', onTap);
        unbindDrag();
        Engine.clear(engine);
        delete box.dataset.live;
        box.style.height = '';
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
