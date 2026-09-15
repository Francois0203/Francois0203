import { useCallback, useEffect, useRef, useState } from 'react';
import Slab from '../Slab';
import styles from './LiveSite.module.css';

/*
 * A client site, actually running. Real embedded sites rather than
 * screenshots, which costs three things: a frame only gets a src near the
 * viewport, at most two load at once, and a site that refuses framing is
 * never framed. The frame stays pointer inert until clicked.
 *
 * Rendered at desktop width then scaled, or every site would show its own
 * mobile layout.
 */

const FRAME_WIDTH = 1440;
const RATIO = 16 / 10;
const MAX_CONCURRENT = 2;
const TIMEOUT = 12_000;

const isTouch = typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches;

/* One gate for every frame on the page. */
const gate = { active: 0, queue: [] };

const acquire = (start) => {
  if (gate.active < MAX_CONCURRENT) { gate.active += 1; start(); return true; }
  gate.queue.push(start);
  return false;
};

const drop = (start) => {
  const i = gate.queue.indexOf(start);
  if (i >= 0) gate.queue.splice(i, 1);
};

const release = () => {
  gate.active = Math.max(0, gate.active - 1);
  const next = gate.queue.shift();
  if (next) { gate.active += 1; next(); }
};

const host = (url) => {
  try { return new URL(url).host.replace(/^www\./, ''); }
  catch { return url; }
};

const LiveSite = ({ site, name, index }) => {
  const target = site?.sites?.[0] ?? site?.site ?? null;
  const url = target?.url ?? target ?? null;
  const embeddable = target?.embeddable !== false;

  const boxRef = useRef(null);
  const timerRef = useRef(null);
  const holdingRef = useRef(false);
  const queuedRef = useRef(null);

  const [phase, setPhase] = useState(embeddable ? 'idle' : 'blocked');
  const [scale, setScale] = useState(0.25);

  // Measured, not assumed: the same card is used at two widths.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const obs = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / FRAME_WIDTH);
    });
    obs.observe(box);
    return () => obs.disconnect();
  }, []);

  const begin = useCallback(() => {
    setPhase('loading');
    timerRef.current = setTimeout(() => setPhase('blocked'), TIMEOUT);
  }, []);

  // Near the viewport, not in it.
  useEffect(() => {
    if (phase !== 'idle' || !embeddable || !url) return undefined;
    if (isTouch) return undefined;

    const box = boxRef.current;
    if (!box) return undefined;

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      queuedRef.current = begin;
      holdingRef.current = acquire(begin);
    }, { rootMargin: '400px 0px' });

    obs.observe(box);
    return () => obs.disconnect();
  }, [phase, embeddable, url, begin]);

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    if (queuedRef.current) drop(queuedRef.current);
    if (holdingRef.current) release();
  }, []);

  const onLoad = () => {
    clearTimeout(timerRef.current);
    setPhase('ready');
    if (holdingRef.current) { holdingRef.current = false; release(); }
  };

  const tapToLoad = () => {
    queuedRef.current = begin;
    holdingRef.current = acquire(begin);
  };

  return (
    <article className={styles.row}>
      <div className={styles.meta}>
        <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
        <h3 className={styles.name}>{name}</h3>
        {site?.description && <p className={styles.desc}>{site.description}</p>}
        {url && (
          <a className={styles.visit} href={url} target="_blank" rel="noopener noreferrer">
            {host(url)}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 11 11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      <Slab live interactive sheen className={styles.screen}>
        <div ref={boxRef} className={styles.viewport} style={{ aspectRatio: RATIO }}>
          {phase === 'ready' || phase === 'loading' ? (
            <iframe
              className={styles.frame}
              src={url}
              title={name}
              loading="lazy"
              tabIndex={-1}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              onLoad={onLoad}
              style={{
                width: FRAME_WIDTH,
                height: FRAME_WIDTH / RATIO,
                transform: `scale(${scale})`,
              }}
            />
          ) : null}

          {phase === 'loading' && (
            <span className={styles.state}>Waking {host(url)}</span>
          )}

          {phase === 'idle' && isTouch && (
            <button type="button" className={styles.tap} onClick={tapToLoad}>
              Load the live site
            </button>
          )}

          {phase === 'blocked' && (
            <span className={styles.state}>
              This site refuses to be framed.
              {url && <a href={url} target="_blank" rel="noopener noreferrer">Open it</a>}
            </span>
          )}
        </div>
      </Slab>
    </article>
  );
};

export default LiveSite;
