import { useCallback, useEffect, useRef, useState } from 'react';
import Chip from '../Chip';
import Slab from '../Slab';
import styles from './Fleet.module.css';


const PALETTE = ['blue', 'green', 'orange', 'pink', 'yellow'];
const FRAME_WIDTH = 1440;
const RATIO = 16 / 10;
const TIMEOUT = 12_000;

const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const host = (url) => {
  try { return new URL(url).host.replace(/^www\./, ''); }
  catch { return url; }
};

const targetsOf = (site) => {
  const list = Array.isArray(site?.sites) ? site.sites : site?.site ? [site.site] : [];
  return list.map(t => (typeof t === 'string' ? { url: t } : t)).filter(t => t?.url);
};

const Fleet = ({ sites = [], label = 'live sites' }) => {
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState(0);
  const [phase, setPhase] = useState('idle');
  const [scale, setScale] = useState(0.25);
  const boxRef = useRef(null);
  const timerRef = useRef(0);

  const site = sites[index] ?? null;
  const targets = targetsOf(site);
  const target = targets[tab] ?? targets[0] ?? null;
  const url = target?.url ?? null;
  const embeddable = target?.embeddable !== false;
  const stack = site?.stack ?? site?.tags ?? [];

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
    clearTimeout(timerRef.current);
    setPhase('loading');
    timerRef.current = setTimeout(() => setPhase('blocked'), TIMEOUT);
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!url || !embeddable) { setPhase('blocked'); return undefined; }
    if (isTouch()) { setPhase('idle'); return undefined; }
    begin();
    return () => clearTimeout(timerRef.current);
  }, [url, embeddable, begin]);

  const select = (i) => { setIndex(i); setTab(0); };

  const onKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select((index + 1) % sites.length); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select((index - 1 + sites.length) % sites.length); }
  };

  if (!sites.length) return null;

  return (
    <Slab className={styles.fleet}>
      <aside className={styles.list}>
        <header className={styles.listHead}>
          <Chip dot="live">{label}</Chip>
          <span className={styles.count}>{sites.length} {sites.length === 1 ? 'site' : 'sites'}</span>
        </header>

        <ul className={styles.rows} data-scrolls role="listbox" aria-label="Client sites" onKeyDown={onKey}>
          {sites.map((s, i) => {
            const t = targetsOf(s)[0];
            const on = i === index;
            return (
              <li key={s.id ?? i} role="option" aria-selected={on}>
                <button
                  type="button"
                  style={{ '--row': `var(--c-${PALETTE[i % PALETTE.length]})` }}
                  className={`${styles.row} ${on ? styles.rowOn : ''}`}
                  onClick={() => select(i)}
                  tabIndex={on ? 0 : -1}
                >
                  <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.rowBody}>
                    <span className={styles.rowName}>{s.name || s.client}</span>
                    {t?.url && <span className={styles.rowHost}>{host(t.url)}</span>}
                  </span>
                  <span className={styles.rowDot} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className={styles.stage}>
        <header className={styles.chrome}>
          <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>

          {targets.length > 1 ? (
            <div className={styles.tabs} data-scrolls role="tablist">
              {targets.map((t, i) => (
                <button
                  key={t.url}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  className={`${styles.tab} ${i === tab ? styles.tabOn : ''}`}
                  onClick={() => setTab(i)}
                >
                  {t.label || host(t.url)}
                </button>
              ))}
            </div>
          ) : (
            <span className={styles.address}>{url ? host(url) : ''}</span>
          )}

          {url && (
            <a className={styles.open} href={url} target="_blank" rel="noopener noreferrer">
              open
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 11 11 5M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </header>

        <div ref={boxRef} className={styles.viewport} style={{ aspectRatio: RATIO }}>
          {(phase === 'ready' || phase === 'loading') && url ? (
            <iframe
              key={url}
              className={styles.frame}
              src={url}
              title={site?.name || host(url)}
              loading="lazy"
              tabIndex={-1}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              onLoad={() => { clearTimeout(timerRef.current); setPhase('ready'); }}
              style={{
                width: FRAME_WIDTH,
                height: FRAME_WIDTH / RATIO,
                transform: `scale(${scale})`,
              }}
            />
          ) : null}

          {phase === 'loading' && (
            <span className={styles.state}>
              <span className={styles.spinner} aria-hidden="true" />
              waking {host(url)}
            </span>
          )}

          {phase === 'idle' && url && (
            <button type="button" className={styles.tap} onClick={begin}>
              load the live site
            </button>
          )}

          {phase === 'blocked' && (
            <span className={styles.state}>
              this site refuses to be framed
              {url && <a href={url} target="_blank" rel="noopener noreferrer">open it</a>}
            </span>
          )}
        </div>

        <footer className={styles.about}>
          <div className={styles.aboutText}>
            <h3 className={styles.aboutName}>{site?.name || site?.client}</h3>
            {(site?.tagline || site?.description) && (
              <p className={styles.aboutDesc}>{site.tagline || site.description}</p>
            )}
          </div>
          {stack.length > 0 && (
            <ul className={styles.stack}>
              {stack.map((s) => <li key={s}><Chip>{s}</Chip></li>)}
            </ul>
          )}
        </footer>
      </div>
    </Slab>
  );
};

export default Fleet;
