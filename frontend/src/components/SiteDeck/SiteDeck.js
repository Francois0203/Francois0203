import { useEffect, useRef, useState } from 'react';
import Button from '../Button';
import Skeleton, { Bone } from '../Skeleton';
import { LiveView, useLiveHover, liveAllowed, linksOf, host } from '../Showcase';
import { useCopy } from '../../content/copy/store';
import styles from './SiteDeck.module.css';

const TONES = ['blue', 'green', 'orange', 'pink', 'yellow'];

// The deck while the sites load.
export const SiteDeckSkeleton = ({ head }) => {
  const { loadingSites } = useCopy('a11y');
  return (
    <div className={styles.deck}>
      <div className={styles.side}>
        {head}
        <Skeleton label={loadingSites} className={styles.wait}>
          {[0, 1, 2].map(i => <Bone key={i} h="var(--row)" r="var(--r-node)" />)}
        </Skeleton>
      </div>
      <div className={`panel ${styles.stage}`}>
        <Bone h="auto" r="calc(var(--r-card) - 10px)" style={{ aspectRatio: '16 / 10.6' }} />
        <div className={styles.foot}><Bone w="10rem" h="0.9rem" /><Bone w="10rem" h="3rem" r="var(--r-control)" /></div>
      </div>
    </div>
  );
};

// A list of client sites beside one large window. Pointing at a name puts that site in the window.
const SiteDeck = ({ sites = [], visitLabel, listLabel, head, more }) => {
  const items = sites.map(site => ({ site, links: linksOf(site) })).filter(x => x.links.length > 0);
  const [at, setAt] = useState(0);
  const [woken, setWoken] = useState(() => new Set());
  const stageRef = useRef(null);
  const [live, setLive] = useState(false);
  useEffect(() => { setLive(liveAllowed()); }, []);
  const [liveOn] = useLiveHover(stageRef, live);

  const i = Math.min(at, items.length - 1);

  // A site only loads for real once its window has been hovered.
  useEffect(() => {
    if (liveOn) setWoken(prev => (prev.has(i) ? prev : new Set(prev).add(i)));
  }, [liveOn, i]);

  if (items.length === 0) return null;

  const [main, ...rest] = items[i].links;
  const tone = TONES[i % TONES.length];
  const nameOf = (x) => x.site.name || host(x.links[0].url);

  const step = (e) => {
    const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + items.length) % items.length;
    setAt(next);
    e.currentTarget.querySelectorAll('button')[next]?.focus();
  };

  return (
    <div className={styles.deck}>
      <div className={styles.side}>
        {head}

        <ul className={styles.list} aria-label={listLabel} style={{ '--at': i }} data-tone={tone} onKeyDown={step} data-rise>
          <li className={styles.key} aria-hidden="true" />
          {items.map((x, k) => (
            <li key={x.site.id ?? k} data-tone={TONES[k % TONES.length]}>
              <button
                type="button"
                className={styles.row}
                aria-current={k === i ? 'true' : undefined}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setAt(k); }}
                onFocus={() => setAt(k)}
                onClick={() => setAt(k)}
              >
                <span className={styles.num} aria-hidden="true">{String(k + 1).padStart(2, '0')}</span>
                <span className={styles.words}>
                  <span className={styles.name}>{nameOf(x)}</span>
                  {(x.site.tagline || x.site.client) && <span className={styles.tagline}>{x.site.tagline || x.site.client}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {more && <div className={styles.more} data-rise>{more}</div>}
      </div>

      <div ref={stageRef} className={`panel ${styles.stage}`} data-tone={tone} data-rise>
        <div className={styles.window}>
          <span className={styles.bar} aria-hidden="true">
            <i /><i /><i />
            <span className={styles.address}>{host(main.url)}</span>
          </span>
          <div className={styles.screen}>
            {items.map((x, k) => (
              <div key={x.site.id ?? k} className={styles.slide} data-on={k === i ? '' : undefined} data-side={k < i ? 'before' : 'after'} aria-hidden="true">
                {x.site.preview
                  ? <img src={x.site.preview} alt="" loading={k === 0 ? 'eager' : 'lazy'} decoding="async" width="1280" height="800" />
                  : <span className={styles.blank}>{nameOf(x).trim().charAt(0)}</span>}
                {live && woken.has(k) && x.links[0].embeddable !== false && (
                  <LiveView url={x.links[0].url} title={nameOf(x)} on={liveOn && k === i} />
                )}
              </div>
            ))}
            <a className={styles.cover} href={main.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true"> </a>
          </div>
        </div>

        <div className={styles.foot}>
          <p key={i} className={styles.now}>
            <strong>{nameOf(items[i])}</strong>
            <span>{host(main.url)}</span>
          </p>
          <div className={styles.links}>
            {rest.map(m => (
              <a key={m.url} className={styles.extra} href={m.url} target="_blank" rel="noopener noreferrer">{m.label || host(m.url)}</a>
            ))}
            <Button as="a" href={main.url} target="_blank" rel="noopener noreferrer" variant="primary" tone={tone} arrow>
              {visitLabel}<span className="sr-only">, {nameOf(items[i])}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDeck;
