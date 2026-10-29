import { useEffect, useRef, useState } from 'react';
import Skeleton, { Bone } from '../Skeleton';
import { gsap, ScrollTrigger, useGSAP, motionOff } from '../../hooks/gsap';
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

// The real site, scaled down and frozen for clicks. It loads once the card is near
// the screen and fades in over the screenshot after it has drawn.
const LiveView = ({ url, title }) => {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNear(true); io.disconnect(); }
    }, { rootMargin: '200px' });
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / FRAME_WIDTH));
    io.observe(el);
    ro.observe(el);
    return () => { io.disconnect(); ro.disconnect(); };
  }, []);

  return (
    <div ref={ref} className={styles.live} style={{ '--s': scale }} data-ready={ready ? '' : undefined}>
      {near && (
        <iframe
          src={url}
          title={`${title}, live preview`}
          tabIndex={-1}
          aria-hidden="true"
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setTimeout(() => setReady(true), 1500)}
        />
      )}
    </div>
  );
};

const Card = ({ site, tone, visitLabel }) => {
  const [live, setLive] = useState(false);
  useEffect(() => { setLive(liveAllowed()); }, []);
  const [main, ...more] = linksOf(site);
  if (!main) return null;
  const name = site.name || host(main.url);
  const about = site.tagline || site.client;

  return (
    <li className={styles.card} style={{ '--tone': `var(--c-${tone})` }}>
      <div className={styles.cover} aria-hidden="true">
        <div className={styles.window}>
          <span className={styles.bar}>
            <i /><i /><i />
            <span className={styles.address}>{host(main.url)}</span>
          </span>
          <div className={styles.screen}>
            {site.preview ? (
              <img className={styles.shot} src={site.preview} alt="" loading="lazy" width="1280" height="800" />
            ) : (
              <span className={styles.page}>
                <span className={styles.sketchNav}><i /><i /><i /></span>
                <SiteIcon url={main.url} name={name} />
                <span className={styles.sketchText}><i /><i /></span>
                <span className={styles.sketchButton} />
              </span>
            )}
            {live && main.embeddable !== false && <LiveView url={main.url} title={name} />}
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
        <span className={styles.visit} aria-hidden="true">
          {visitLabel}
          <svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </span>
        {more.map(m => (
          <a key={m.url} className={styles.more} href={m.url} target="_blank" rel="noopener noreferrer">{m.label || host(m.url)}</a>
        ))}
      </div>
    </li>
  );
};

// Card-shaped placeholders while the sites load.
export const ShowcaseSkeleton = ({ count = 2 }) => (
  <Skeleton label="Loading client websites">
    <ul className={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`${styles.card} ${styles.ghost}`}>
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
        </li>
      ))}
    </ul>
  </Skeleton>
);

// Client websites as simple cards: what it is, who it is for, and one button to open it.
const Showcase = ({ sites = [], visitLabel = 'Visit website' }) => {
  const grid = useRef(null);

  useGSAP(() => {
    if (motionOff()) return;
    const cards = gsap.utils.toArray(grid.current.children);
    gsap.set(cards, { autoAlpha: 0, y: 70, rotation: (i) => (i % 2 ? 2.5 : -2.5) });
    ScrollTrigger.batch(cards, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        autoAlpha: 1, y: 0, rotation: 0, duration: 0.9, stagger: 0.12, ease: 'back.out(1.4)',
        clearProps: 'transform,opacity,visibility',
      }),
    });
  }, { scope: grid, dependencies: [sites.length] });

  return (
    <ul ref={grid} className={styles.grid}>
      {sites.map((site, i) => (
        <Card key={site.id ?? i} site={site} tone={TONES[i % TONES.length]} visitLabel={visitLabel} />
      ))}
    </ul>
  );
};

export default Showcase;
