import { useEffect, useRef, useState } from 'react';
import Skeleton, { Bone } from '../Skeleton';
import { gsap, motionOff } from '../../hooks/gsap';
import useTilt from '../../hooks/useTilt';
import { useCopy } from '../../content/copy/store';
import styles from './Showcase.module.css';

const TONES = ['blue', 'green', 'orange', 'pink', 'yellow'];

const linksOf = (site) => {
  const list = Array.isArray(site?.sites) ? site.sites : [];
  return list.map(t => (typeof t === 'string' ? { url: t } : t)).filter(t => t?.url);
};

const host = (url) => {
  try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; }
};

// The site's first letter, swapped for its own icon only once that icon has really loaded.
const SiteIcon = ({ url, name }) => {
  const [loaded, setLoaded] = useState(false);
  let src = null;
  try { src = `${new URL(url).origin}/favicon.ico`; } catch { /* not a full url */ }
  return (
    <>
      {!loaded && <span className={styles.initial}>{(name || '?').trim().charAt(0)}</span>}
      {src && (
        <img
          className={styles.icon}
          src={src}
          alt=""
          loading="lazy"
          hidden={!loaded}
          onLoad={(e) => { if (e.currentTarget.naturalWidth > 0) setLoaded(true); }}
        />
      )}
    </>
  );
};

const FRAME_WIDTH = 1280;

// Live views only on computers with data to spare. Phones keep the screenshot.
const liveAllowed = () => typeof window !== 'undefined'
  && window.innerWidth >= 700
  && !window.matchMedia('(pointer: coarse)').matches
  && !navigator.connection?.saveData;

// The real site, scaled down and click-proof. Loaded the first time its card is hovered, shown only while it is.
const LiveView = ({ url, title, on }) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / FRAME_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.live} style={{ '--s': scale }} data-ready={ready ? '' : undefined} data-on={on ? '' : undefined}>
      <iframe
        src={url}
        title={`${title}, live preview`}
        tabIndex={-1}
        aria-hidden="true"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setTimeout(() => setReady(true), 700)}
      />
    </div>
  );
};

// Hovering wakes the live site, but only a real mouse move does: cards sliding under a still cursor while
// the page scrolls never count, and scrolling puts the screenshot back.
const useLiveHover = (cardRef, allowed) => {
  const [on, setOn] = useState(false);
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !allowed) return undefined;
    let scrolling = false;
    let timer = 0;
    let lit = false;
    const set = (v) => { if (v !== lit) { lit = v; setOn(v); if (v) setWanted(true); } };
    const move = () => { if (!scrolling) set(true); };
    const leave = () => set(false);
    const scroll = () => {
      scrolling = true;
      set(false);
      clearTimeout(timer);
      timer = setTimeout(() => { scrolling = false; }, 250);
    };
    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      clearTimeout(timer);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
    };
  }, [cardRef, allowed]);
  return [on, wanted];
};

const ARROW = <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>;

// The card's call to action: pulls toward the pointer and floods with colour from where it enters.
const useVisit = (cardRef, visitRef) => {
  useEffect(() => {
    const card = cardRef.current;
    const btn = visitRef.current;
    if (!card || !btn || motionOff() || window.matchMedia('(pointer: coarse)').matches) return undefined;
    const pullX = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const pullY = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    const aim = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--fx', `${Math.max(0, Math.min(r.width, e.clientX - r.left)).toFixed(0)}px`);
      btn.style.setProperty('--fy', `${Math.max(0, Math.min(r.height, e.clientY - r.top)).toFixed(0)}px`);
    };
    const move = (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < 160;
      pullX(near ? Math.max(-12, Math.min(12, dx * 0.22)) : 0);
      pullY(near ? Math.max(-8, Math.min(8, dy * 0.3)) : 0);
    };
    const leave = (e) => { aim(e); pullX(0); pullY(0); };
    card.addEventListener('pointerenter', aim);
    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', leave);
    return () => {
      card.removeEventListener('pointerenter', aim);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(btn);
    };
  }, [cardRef, visitRef]);
};

const Card = ({ site, tone, visitLabel, index }) => {
  const ref = useRef(null);
  const visitRef = useRef(null);
  const [pressed, setPressed] = useState(0);
  useTilt(ref, { max: 4 });
  useVisit(ref, visitRef);
  const [live, setLive] = useState(false);
  useEffect(() => { setLive(liveAllowed()); }, []);
  const [liveOn, liveWanted] = useLiveHover(ref, live);
  const [main, ...more] = linksOf(site);
  if (!main) return null;
  const name = site.name || host(main.url);
  const about = site.tagline || site.client;

  return (
    <li className={styles.slot} data-rise="flip">
      <div ref={ref} className={`glass ${styles.card}`} data-tone={tone} style={{ '--k': index }} onClick={() => setPressed(n => n + 1)}>
        <div className={styles.cover} aria-hidden="true">
          <div className={styles.window}>
            <span className={styles.bar}>
              <i /><i /><i />
              <span className={styles.address}>{host(main.url)}</span>
            </span>
            <div className={styles.screen}>
              {site.preview ? (
                <img className={styles.shot} src={site.preview} alt="" loading="lazy" decoding="async" width="1280" height="800" />
              ) : (
                <span className={styles.page}>
                  <span className={styles.sketchNav}><i /><i /><i /></span>
                  <SiteIcon url={main.url} name={name} />
                  <span className={styles.sketchText}><i /><i /></span>
                  <span className={styles.sketchButton} />
                </span>
              )}
              {live && liveWanted && main.embeddable !== false && <LiveView url={main.url} title={name} on={liveOn} />}
            </div>
          </div>
        </div>

        <div className={styles.text}>
          <h3 className={styles.name}>
            <a className={styles.stretch} href={main.url} target="_blank" rel="noopener noreferrer">{name}</a>
          </h3>
          {about && <p className={styles.about}>{about}</p>}
          {site.description && <p className={styles.description}>{site.description}</p>}
        </div>

        <div className={styles.foot}>
          <span ref={visitRef} className={styles.cta} aria-hidden="true">
            {pressed > 0 && <span key={pressed} className={styles.ripple} />}
            <span className={styles.visit}>
              <span className={styles.flood} />
              <span className={styles.roll} data-text={visitLabel}><span>{visitLabel}</span></span>
              <span className={styles.orb}>{ARROW}{ARROW}</span>
            </span>
          </span>
          <span className={styles.host}>{host(main.url)}</span>
          {more.map(m => (
            <a key={m.url} className={styles.more} href={m.url} target="_blank" rel="noopener noreferrer">{m.label || host(m.url)}</a>
          ))}
        </div>
      </div>
    </li>
  );
};

// Card-shaped placeholders while the sites load.
export const ShowcaseSkeleton = ({ count = 2 }) => {
  const { loadingSites } = useCopy('a11y');
  return (
    <Skeleton label={loadingSites}>
      <ul className={styles.grid}>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className={styles.slot}><div className={`glass ${styles.card} ${styles.ghost}`}>
            <div className={styles.cover}>
              <div className={styles.window}>
                <span className={styles.bar}><i /><i /><i /><Bone w="45%" h="0.9rem" r="999px" /></span>
                <div className={styles.screen}><Bone h="100%" r="0" /></div>
              </div>
            </div>
            <div className={styles.text}>
              <Bone w="55%" h="1.4rem" />
              <Bone w="80%" h="0.85rem" style={{ marginTop: '0.6rem' }} />
              <Bone w="95%" h="0.75rem" style={{ marginTop: '0.9rem' }} />
              <Bone w="70%" h="0.75rem" style={{ marginTop: '0.4rem' }} />
            </div>
            <div className={styles.foot}><Bone w="9rem" h="2.3rem" r="999px" /></div>
          </div></li>
        ))}
      </ul>
    </Skeleton>
  );
};

// Client websites as simple cards: what it is, who it is for, and one button to open it.
const Showcase = ({ sites = [], visitLabel = 'Visit website' }) => {
  return (
    <ul className={styles.grid}>
      {sites.map((site, i) => (
        <Card key={site.id ?? i} index={i} site={site} tone={TONES[i % TONES.length]} visitLabel={visitLabel} />
      ))}
    </ul>
  );
};

export default Showcase;
