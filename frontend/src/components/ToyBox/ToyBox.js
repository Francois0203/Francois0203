import { useEffect, useRef, useState } from 'react';
import { gsap, afterIntro } from '../../hooks/gsap';
import styles from './ToyBox.module.css';

const STEP = 1000 / 60;
const MAX_SPEED = 28;

let matterPromise = null;
const loadMatter = () => (matterPromise ??= import('matter-js').then(m => m.default));

const still = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

// The photo sits in the middle of a box of toys. Grab and throw them, or tap to shake on phones.
const ToyBox = ({ photo, name = '', toys = [], hint, hintTouch }) => {
  const boxRef = useRef(null);
  const faceRef = useRef(null);
  const nodes = useRef([]);
  const [held, setHeld] = useState(null);
  const [played, setPlayed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [coarse] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  const list = toys.slice(0, 12);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('');

  useEffect(() => {
    const box = boxRef.current;
    const face = faceRef.current;
    if (!box || !face) return undefined;
    if (still()) { box.dataset.still = ''; return undefined; }

    let cancelled = false;
    let teardown = () => {};
    loadMatter();

    gsap.set(face, { scale: 0.6, autoAlpha: 0, rotation: -10, transformPerspective: 900 });

    const tiltX = gsap.quickTo(face, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const tiltY = gsap.quickTo(face, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const look = (e) => {
      const r = face.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / window.innerWidth * 2));
      const ny = Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / window.innerHeight * 2));
      tiltX(nx * 14);
      tiltY(ny * -12);
    };

    let lastBump = 0;
    const bump = () => {
      const now = performance.now();
      if (now - lastBump < 220) return;
      lastBump = now;
      gsap.fromTo(face, { scale: 0.955 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.35)', overwrite: 'auto' });
    };

    const start = async () => {
      const Matter = await loadMatter();
      if (cancelled) return;
      const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Sleeping } = Matter;

      const W = box.clientWidth;
      const H = box.clientHeight;
      const R = face.offsetWidth / 2;
      const cx = face.offsetLeft + R;
      const cy = face.offsetTop + R;
      const sizes = nodes.current.map(n => (n ? { w: n.offsetWidth, h: n.offsetHeight } : { w: 0, h: 0 }));

      const engine = Engine.create({ gravity: { y: 1.05 }, enableSleeping: true });
      const wall = { isStatic: true, friction: 0.2 };
      const head = Bodies.circle(cx, cy, R, { isStatic: true, restitution: 0.7 });
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + 50, W * 3, 100, wall),
        Bodies.rectangle(-100, -2000 + H / 2, 200, 4000 + H, wall),
        Bodies.rectangle(W + 100, -2000 + H / 2, 200, 4000 + H, wall),
        head,
      ]);

      const spawn = (i, s) => ({
        x: s.w / 2 + 8 + ((i * 0.618 * W + 40) % Math.max(1, W - s.w - 16)),
        y: -s.h - i * (coarse ? 55 : 75),
      });

      const bodies = sizes.map((s, i) => {
        const { x, y } = spawn(i, s);
        const opts = { restitution: 0.5, friction: 0.25, frictionAir: 0.012, density: 0.0012 };
        const b = list[i].Icon
          ? Bodies.circle(x, y, s.w / 2, opts)
          : Bodies.rectangle(x, y, s.w, s.h, { ...opts, chamfer: { radius: s.h / 2 - 1 } });
        Body.setAngle(b, (i % 2 ? 1 : -1) * (0.2 + (i % 4) * 0.15));
        return b;
      });
      Composite.add(engine.world, bodies);

      // Drawn between the last two physics steps, so 90 and 120 Hz screens glide instead of judder.
      const prev = bodies.map(b => ({ x: b.position.x, y: b.position.y, a: b.angle }));
      const drawn = bodies.map(() => '');
      const remember = () => bodies.forEach((b, i) => { prev[i].x = b.position.x; prev[i].y = b.position.y; prev[i].a = b.angle; });
      const place = (b, i, k = 1) => {
        const n = nodes.current[i];
        if (!n) return;
        const p = prev[i];
        const x = p.x + (b.position.x - p.x) * k - sizes[i].w / 2;
        const y = p.y + (b.position.y - p.y) * k - sizes[i].h / 2;
        const a = p.a + (b.angle - p.a) * k;
        const t = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${a.toFixed(4)}rad)`;
        if (t !== drawn[i]) { n.style.transform = t; drawn[i] = t; }
      };
      const jump = (b, i, to) => {
        Body.setPosition(b, to);
        Body.setVelocity(b, { x: 0, y: 0 });
        prev[i].x = to.x; prev[i].y = to.y; prev[i].a = b.angle;
      };
      bodies.forEach((b, i) => place(b, i));
      box.dataset.live = '';

      // No lid: the side walls run far above the box, so anything thrown up can only fall back in.
      const below = (i) => ({ x: sizes[i].w / 2 + Math.random() * Math.max(1, W - sizes[i].w), y: Math.min(H - sizes[i].h, cy + R + sizes[i].h) });
      let landed = false;

      Events.on(engine, 'collisionStart', (e) => {
        for (const p of e.pairs) {
          const other = p.bodyA === head ? p.bodyB : p.bodyB === head ? p.bodyA : null;
          if (other && Math.hypot(other.velocity.x, other.velocity.y) > 5) { bump(); break; }
        }
      });

      const indexOf = (body) => bodies.indexOf(body);
      let grabbed = null;
      let onTap = null;
      let unbind = () => {};
      if (!coarse) {
        const mouse = Mouse.create(box);
        ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach(ev => mouse.element.removeEventListener(ev, mouse.mousewheel));
        // The drag target stays where a toy can actually be: inside the walls, above the floor and off the photo.
        // Otherwise the pull and a solid surface fight every frame and the toy shudders or tunnels through.
        Events.on(engine, 'beforeUpdate', () => {
          if (!grabbed) return;
          const i = indexOf(grabbed);
          // A little clearance, so the toy rests just short of the surface instead of pressing into it.
          const hw = sizes[i].w / 2 + 4;
          const hh = sizes[i].h / 2 + 4;
          const p = mouse.position;
          p.x = Math.max(hw, Math.min(W - hw, p.x));
          p.y = Math.min(H - hh, p.y);
          const dx = p.x - cx;
          const dy = p.y - cy;
          const d = Math.hypot(dx, dy);
          const clear = R + Math.max(hw, hh);
          if (d < clear) {
            const k = clear / (d || 1);
            p.x = cx + (d ? dx : 0) * k;
            p.y = cy + (d ? dy : -clear) * (d ? k : 1);
          }
        });
        const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.32, damping: 0.08, render: { visible: false } } });
        Composite.add(engine.world, drag);
        Events.on(drag, 'startdrag', (e) => {
          const i = indexOf(e.body);
          if (i < 0) return;
          grabbed = e.body;
          box.dataset.grabbing = '';
          setHeld(i);
          setPlayed(true);
        });
        Events.on(drag, 'enddrag', () => { grabbed = null; delete box.dataset.grabbing; setHeld(null); });

        const follow = (e) => { if (mouse.button === 0) mouse.mousemove(e); };
        const release = (e) => { if (mouse.button !== -1) mouse.mouseup(e); };
        const drop = () => { mouse.button = -1; };
        const onHidden = () => { if (document.hidden) drop(); };
        window.addEventListener('mousemove', follow, { passive: true });
        window.addEventListener('mouseup', release, { passive: true });
        window.addEventListener('blur', drop);
        document.addEventListener('visibilitychange', onHidden);
        unbind = () => {
          window.removeEventListener('mousemove', follow);
          window.removeEventListener('mouseup', release);
          window.removeEventListener('blur', drop);
          document.removeEventListener('visibilitychange', onHidden);
        };
      } else {
        // A tap pushes out from where it lands: near toys jump, far ones barely stir.
        onTap = (e) => {
          const r = box.getBoundingClientRect();
          const tx = e.clientX - r.left;
          const ty = e.clientY - r.top;
          const reach = Math.max(W, H) * 0.75;
          setPlayed(true);
          wake();
          bodies.forEach((b) => {
            if (b.velocity.y < -3) return;
            const dx = b.position.x - tx;
            const dy = b.position.y - ty;
            const d = Math.hypot(dx, dy) || 1;
            const s = Math.max(0, 1 - d / reach);
            if (s < 0.08) return;
            Sleeping.set(b, false);
            Body.setVelocity(b, {
              x: Math.max(-12, Math.min(12, b.velocity.x + (dx / d) * 8 * s)),
              y: Math.max(-15, Math.min(0, b.velocity.y) - (5 + 9 * s)),
            });
            Body.setAngularVelocity(b, (dx / d) * 0.18 * s);
          });
        };
        box.addEventListener('click', onTap);
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
        while (carry >= STEP) {
          remember();
          Engine.update(engine, STEP);
          carry -= STEP;
        }
        if (!landed && bodies.every((b, i) => b.position.y - sizes[i].h / 2 > 2)) landed = true;
        bodies.forEach((b, i) => {
          const { x, y } = b.position;
          if (!Number.isFinite(x) || !Number.isFinite(y) || y > H + 120 || x < -40 || x > W + 40) {
            jump(b, i, landed ? below(i) : spawn(i, sizes[i]));
            Sleeping.set(b, false);
          }
          const speed = Math.hypot(b.velocity.x, b.velocity.y);
          // Nothing rests on the crown of the photo: it slides gently off, then is left to settle wherever it lands.
          const onCrown = y + sizes[i].h / 2 < cy - R * 0.45 && Math.abs(x - cx) < R * 0.8;
          if (onCrown && b !== grabbed && speed < 1.2 && y > 0 && (b.slid ?? 0) < 150) {
            b.slid = (b.slid ?? 0) + 1;
            Sleeping.set(b, false);
            const side = Math.sign(x - cx) || (i % 2 ? 1 : -1);
            Body.applyForce(b, b.position, { x: side * b.mass * 0.0004, y: 0 });
          } else if (!onCrown) b.slid = 0;
          if (speed > MAX_SPEED) Body.setVelocity(b, { x: b.velocity.x / speed * MAX_SPEED, y: b.velocity.y / speed * MAX_SPEED });
          place(b, i, carry / STEP);
        });
        // Everything asleep: stop the loop entirely until someone touches the box.
        if (landed && !grabbed && bodies.every(b => b.isSleeping) && grace <= 0) return;
        if (grace > 0) grace -= 1;
        if (visible) raf = requestAnimationFrame(tick);
      };
      const wake = () => {
        // Run a short while after any touch, so a grab or tap always reaches the physics before it can pause.
        grace = 30;
        if (raf || !visible) return;
        last = performance.now();
        carry = 0;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      box.addEventListener('pointerdown', wake);
      box.addEventListener('pointermove', wake, { passive: true });

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) wake();
        else { cancelAnimationFrame(raf); raf = 0; }
      });
      io.observe(box);

      teardown = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        if (onTap) box.removeEventListener('click', onTap);
        box.removeEventListener('pointerdown', wake);
        box.removeEventListener('pointermove', wake);
        unbind();
        Engine.clear(engine);
      };
    };

    let gate = null;
    const stop = afterIntro(() => {
      gate = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        gate.disconnect();
        gsap.to(face, {
          scale: 1, autoAlpha: 1, rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.55)',
          onStart: () => { setTimeout(start, 250); },
        });
        if (!coarse) window.addEventListener('pointermove', look, { passive: true });
      }, { threshold: 0.2 });
      gate.observe(box);
    });

    return () => {
      cancelled = true;
      stop();
      gate?.disconnect();
      window.removeEventListener('pointermove', look);
      gsap.killTweensOf(face);
      teardown();
    };
  }, [list.length, coarse]);

  const caption = held !== null ? list[held]?.label : !played ? (coarse ? hintTouch : hint) : null;

  return (
    <div ref={boxRef} className={styles.box}>
      <span className={styles.floor} aria-hidden="true" />
      <span className={styles.shadow} aria-hidden="true" />
      <div ref={faceRef} className={styles.face}>
        <span className={styles.bezel}>
          {photo && !failed
            ? <img className={styles.photo} src={photo} alt={name} width="640" height="640" fetchPriority="high" onError={() => setFailed(true)} />
            : <span className={styles.initials} role="img" aria-label={name}>{initials}</span>}
        </span>
      </div>

      <div className={styles.toys} aria-hidden="true">
        {list.map(({ label, Icon, tone }, i) => (
          <span
            key={label}
            ref={(el) => { nodes.current[i] = el; }}
            className={Icon ? styles.ball : styles.pill}
            style={{ '--tone': `var(--c-${tone})` }}
            onPointerEnter={() => { if (!boxRef.current?.dataset.grabbing) setHeld(i); }}
            onPointerLeave={() => { if (!boxRef.current?.dataset.grabbing) setHeld(null); }}
          >
            {Icon ? <Icon className={styles.icon} /> : <><span className={styles.dot} />{label}</>}
          </span>
        ))}
      </div>

      <p className={styles.caption} aria-hidden="true" data-on={caption ? '' : undefined} data-held={held !== null ? '' : undefined}>
        {caption}
      </p>
    </div>
  );
};

export default ToyBox;
