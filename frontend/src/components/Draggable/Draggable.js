import { useEffect, useRef } from 'react';
import { gsap } from '../../hooks/gsap';
import styles from './Draggable.module.css';

let pluginPromise = null;
const loadPlugin = () => (pluginPromise ??= import('gsap/Draggable').then((m) => {
  gsap.registerPlugin(m.Draggable);
  return m.Draggable;
}));

const calm = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

// Grab and toss the child. It springs home unless stay is set.
const Draggable = ({ as: Tag = 'div', stay = false, bounds, className = '', children, onGrab, ...rest }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || calm()) return undefined;
    let drag = null;
    let alive = true;
    loadPlugin().then((Plugin) => {
      if (!alive) return;
      [drag] = Plugin.create(el, {
        type: 'x,y',
        bounds: bounds ?? undefined,
        zIndexBoost: true,
        minimumMovement: 4,
        onPress() { gsap.to(el, { scale: 1.06, rotation: gsap.utils.random(-4, 4), duration: 0.3, ease: 'back.out(2)' }); },
        onDragStart() { el.dataset.grabbed = ''; onGrab?.(); },
        onRelease() {
          delete el.dataset.grabbed;
          gsap.to(el, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
          if (!stay) gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(0.9, 0.45)' });
        },
      });
    });
    return () => { alive = false; drag?.kill(); gsap.killTweensOf(el); };
  }, [stay, bounds, onGrab]);

  return (
    <Tag ref={ref} className={[styles.drag, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  );
};

export default Draggable;
