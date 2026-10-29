import { useEffect, useRef, useState } from 'react';
import { gsap, afterIntro } from '../../hooks/gsap';
import styles from './ToyBox.module.css';

const STEP = 1000 / 60;

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
      tiltX(Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / window.innerWidth * 2)) * 12);
      tiltY(Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / window.innerHeight * 2)) * -10);
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
        Bodies.rectangle(-50, -H, 100, H * 6, wall),
        Bodies.rectangle(W + 50, -H, 100, H * 6, wall),
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

      const place = (b, i) => {
        const n = nodes.current[i];
        if (!n) return;
        n.style.transform = `translate3d(${(b.position.x - sizes[i].w / 2).toFixed(1)}px, ${(b.position.y - sizes[i].h / 2).toFixed(1)}px, 0) rotate(${b.angle.toFixed(3)}rad)`;
      };
      bodies.forEach(place);
      box.dataset.live = '';

      Events.on(engine, 'collisionStart', (e) => {
        for (const p of e.pairs) {
          const other = p.bodyA === head ? p.bodyB : p.bodyB === head ? p.bodyA : null;
          if (other && Math.hypot(other.velocity.x, other.velocity.y) > 5) { bump(); break; }
        }
      });

      const indexOf = (body) => bodies.indexOf(body);
      let onTap = null;
      let unbind = () => {};
      if (!coarse) {
        const mouse = Mouse.create(box);
        ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach(ev => mouse.element.removeEventListener(ev, mouse.mousewheel));
        const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, render: { visible: false } } });
        Composite.add(engine.world, drag);
        Events.on(drag, 'startdrag', (e) => {
          const i = indexOf(e.body);
          if (i < 0) return;
          box.dataset.grabbing = '';
          setHeld(i);
          setPlayed(true);
        });
        Events.on(drag, 'enddrag', () => { delete box.dataset.grabbing; setHeld(null); });

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
        onTap = (e) => {
          const r = box.getBoundingClientRect();
          const tx = e.clientX - r.left;
          setPlayed(true);
          bodies.forEach((b) => {
            Sleeping.set(b, false);
            const dir = Math.sign(b.position.x - tx) || 1;
            Body.setVelocity(b, { x: dir * (2 + Math.random() * 5), y: -8 - Math.random() * 8 });
            Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.3);
          });
        };
        box.addEventListener('pointerdown', onTap);
      }

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
        bodies.forEach((b, i) => {
          if (b.position.y > H + 200 || b.position.x < -200 || b.position.x > W + 200) {
            Body.setPosition(b, spawn(i, sizes[i]));
            Body.setVelocity(b, { x: 0, y: 0 });
          }
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
        if (onTap) box.removeEventListener('pointerdown', onTap);
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
      <div ref={faceRef} className={styles.face}>
        {photo && !failed
          ? <img className={styles.photo} src={photo} alt={name} width="640" height="640" fetchPriority="high" onError={() => setFailed(true)} />
          : <span className={styles.initials} role="img" aria-label={name}>{initials}</span>}
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
            {Icon ? <Icon className={styles.icon} /> : label}
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
