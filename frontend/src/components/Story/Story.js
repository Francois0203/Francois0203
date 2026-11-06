import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Lightbox from '../Lightbox';
import Rail, { railTimelines } from '../Rail/Rail';
import { useCopy } from '../../content/copy/store';
import styles from './Story.module.css';

const PALETTE = ['blue', 'green', 'orange', 'pink', 'yellow'];

const RING = 2 * Math.PI * 47;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const parseDate = (text) => {
  const t = String(text ?? '').trim();
  const y = /\b(19|20)\d{2}\b/.exec(t);
  if (!y) return null;
  const head = t.slice(0, y.index).toLowerCase();
  const m = MONTHS.findIndex(mo => head.includes(mo));
  return { y: Number(y[0]), m: m >= 0 ? m : null };
};

const unit = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const lengthOf = (a, b, w) => {
  if (!a || !b) return null;
  if (a.m === null || b.m === null) {
    const years = b.y - a.y + 1;
    return years > 0 ? unit(years, w.storyYear, w.storyYears) : null;
  }
  const months = (b.y - a.y) * 12 + (b.m - a.m) + 1;
  if (months <= 0) return null;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && unit(y, w.storyYear, w.storyYears), m && unit(m, w.storyMonth, w.storyMonths)].filter(Boolean).join(' ');
};

const spanOf = (c, w) => {
  const start = String(c.start ?? '').trim();
  const end = String(c.end ?? '').trim();
  const now = new Date();
  const current = !c.next && Boolean(start) && !end;
  const a = parseDate(start);
  const b = current ? { y: now.getFullYear(), m: now.getMonth() } : parseDate(end);
  return {
    current,
    next: Boolean(c.next),
    fromYear: c.next ? w.storyNowShort : a ? String(a.y) : null,
    toYear: current ? w.storyNowShort : b ? String(b.y) : c.next ? w.storyNextShort : null,
    fromLabel: c.next ? w.storyNowLong : start || null,
    toLabel: current ? w.storyPresent : end || (c.next ? w.storyNextLong : null),
    length: c.next ? null : lengthOf(a, b, w),
    sameYear: Boolean(a && b && !current && !c.next && a.y === b.y && a.m !== null && b.m !== null && a.m !== b.m),
    fromMonth: a?.m ?? null,
    toMonth: b?.m ?? null,
  };
};

// The chapter cards. Memoised and told nothing about scroll, so moving between chapters never re-renders them.
const Run = memo(({ runRef, chapters, head, words, kinds, photosFor, photosLabel, thumbs, onOpen, onStop }) => (
    <div ref={runRef} className={styles.chapters}>
      {head && <div className={styles.head}>{head}</div>}
      <ol className={styles.run}>
        <Rail as="li" onProgress={onStop} />
        {chapters.map((c, i) => {
          const sp = spanOf(c, words);
          return (
            <li
              key={c.id ?? i}
              className={styles.chapter}
              data-chapter={i}
              data-tone={PALETTE[i % PALETTE.length]}
              data-active={i === 0 ? '' : undefined}
              style={{ '--chapter': `var(--c-${PALETTE[i % PALETTE.length]})`, '--chapter-ink': `var(--c-${PALETTE[i % PALETTE.length]}-ink)` }}
            >
              <span className={styles.node} data-stop aria-hidden="true" />
              <div className={`glass ${styles.chapterInner}`}>
                <p className={styles.kind}>
                  <span className={styles.kindDot} data-kind={c.kind} aria-hidden="true" />
                  {kinds[c.kind] ?? c.kind}
                </p>
                <h3 className={styles.place}>{c.place}</h3>
                {c.what && <p className={styles.what}>{c.what}</p>}
                {(sp.fromLabel || sp.toLabel) && (
                  <div className={styles.span} data-open={sp.current || sp.next ? '' : undefined}>
                    {sp.fromLabel && (
                      <span className={styles.stop}><small>{words.storyFrom}</small>{sp.fromLabel}</span>
                    )}
                    <span className={styles.bar} aria-hidden={sp.length ? undefined : 'true'}>
                      {sp.length && <span className={styles.length}>{sp.length}</span>}
                    </span>
                    {sp.toLabel && (
                      <span className={styles.stop} data-end><small>{sp.next ? 'by' : 'to'}</small>{sp.toLabel}</span>
                    )}
                  </div>
                )}
                {c.note && <p className={styles.note}>{c.note}</p>}
                {(photosFor[c.id] ?? []).length > 0 && (
                  <div className={styles.shots}>
                    <span className={styles.shotsLabel}>{photosFor[c.id].length} {photosLabel}</span>
                    <ul>
                      {photosFor[c.id].slice(0, 4).map((p, k) => (
                        <li key={p.id ?? k}>
                          <button
                            type="button"
                            ref={(el) => { thumbs.current[`${c.id}-${k}`] = el; }}
                            className={styles.shot}
                            style={{ '--tint': p.tint ?? 'var(--surface-2)', '--k': k }}
                            onClick={() => onOpen({ chapter: c.id, index: k })}
                            aria-label={p.caption || `${c.place}, ${words.storyPhoto} ${k + 1}`}
                          >
                            <img src={p.thumb || p.src} alt="" loading="lazy" decoding="async" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.tags?.length > 0 && (
                  <ul className={styles.chapterTags}>
                    {c.tags.map(t => <li key={t}>{t}</li>)}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
));

Run.displayName = 'Run';

const Story = ({ chapters = [], photo, name = '', photosFor = {}, photosLabel = 'photos', viewerLabels, head = null, kinds = {} }) => {
  const words = useCopy('home');
  const [viewer, setViewer] = useState(null);
  const thumbs = useRef({});
  const originOf = useCallback((i) => thumbs.current[`${viewer?.chapter}-${i}`]?.querySelector('img'), [viewer?.chapter]);
  const sectionRef = useRef(null);
  const runRef = useRef(null);
  const ringRef = useRef(null);
  const photoRef = useRef(null);
  const [active, setActive] = useState(0);
  const [css, setCss] = useState(false);
  useEffect(() => { setCss(railTimelines()); }, []);
  const activeRef = useRef(0);

  // The ring reaches each tick exactly when the rail reaches that chapter.
  const n = chapters.length;
  const track = useCallback((p, last) => {
    // Runs every scroll frame: write to the two elements that move, and re-render only when the chapter changes.
    // p is null when the rail's scroll timeline moves the ring and photo itself.
    if (p !== null) {
      photoRef.current?.style.setProperty('--p', p.toFixed(4));
      const arc = last < 0 ? 0 : (0.5 + p * (n - 1)) / n;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING * (1 - arc));
    }
    const next = Math.max(0, last);
    if (next !== activeRef.current) {
      activeRef.current = next;
      runRef.current?.querySelectorAll('[data-chapter]').forEach((el, i) => el.toggleAttribute('data-active', i === next));
      setActive(next);
    }
  }, [n]);

  if (!chapters.length) return null;

  const current = chapters[active] ?? chapters[0];
  const span = spanOf(current, words);
  const monthName = (m) => words.storyMonthNames.split(',').map(x => x.trim())[m] || MONTHS[m];
  const fromYear = span.sameYear ? monthName(span.fromMonth) : span.fromYear ?? span.toYear ?? String(new Date().getFullYear());
  const toYear = span.sameYear ? monthName(span.toMonth) : span.toYear && span.toYear !== fromYear ? span.toYear : null;
  const where = span.sameYear ? `${current.place}, ${span.fromYear}` : current.place;
  const tags = (current.tags ?? []).slice(0, 6);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('');
  const colour = PALETTE[active % PALETTE.length];
  const scene = (photosFor[current.id] ?? [])[0];

  return (
    <div
      ref={sectionRef}
      className={styles.story}
      data-css={css ? '' : undefined}
      style={{ '--n': chapters.length, '--ring-from': `${(RING * (1 - 0.5 / chapters.length)).toFixed(2)}px`, '--ring-to': `${(RING * 0.5 / chapters.length).toFixed(2)}px` }}
    >
      <div className={styles.pin} style={{ '--cc': `var(--c-${colour})`, '--cc-ink': `var(--c-${colour}-ink)` }}>
        <div className={styles.stage}>
          <div className={styles.figure}>
            <span className={styles.glow} key={`s${active}`} aria-hidden="true" />
            <span className={styles.disc} aria-hidden="true" />
            <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="47" className={styles.track} />
              <circle
                ref={ringRef}
                cx="50"
                cy="50"
                r="47"
                className={styles.fill}
                style={{ strokeDasharray: RING, strokeDashoffset: RING }}
              />
              {chapters.map((c, i) => {
                const a = ((i + 0.5) / chapters.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <circle
                    key={c.id ?? i}
                    cx={50 + Math.cos(a) * 47}
                    cy={50 + Math.sin(a) * 47}
                    r="1.6"
                    className={i <= active ? styles.tickOn : styles.tick}
                  />
                );
              })}
            </svg>

            <div className={styles.photo} ref={photoRef}>
              {photo
                ? <img src={photo} alt="" width="320" height="320" loading="lazy" />
                : <span className={styles.initials}>{initials}</span>}
              {scene && (
                <img
                  key={scene.id}
                  className={styles.scene}
                  src={scene.thumb || scene.src}
                  alt=""
                  style={{ '--tint': scene.tint ?? 'transparent' }}
                />
              )}
            </div>

            <ul className={styles.tags} key={`t${active}`} aria-hidden="true">
              {tags.map((t, i) => (
                <li key={t} data-slot={i} style={{ '--i': i }}>{t}</li>
              ))}
            </ul>
          </div>

          <div className={styles.meta}>
            <span className={styles.count}>
              {String(active + 1).padStart(2, '0')} <span>/ {String(chapters.length).padStart(2, '0')}</span>
            </span>
            <span className={styles.range} key={`y${active}`} aria-label={toYear ? `${fromYear} ${words.storyTo} ${toYear}` : fromYear}>
              <span className={styles.year}>{fromYear}</span>
              {toYear && (
                <>
                  <svg className={styles.rangeLine} viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h24M20 2l7 6-7 6" />
                  </svg>
                  <span className={styles.year} data-end data-now={span.current || span.next ? '' : undefined}>{toYear}</span>
                </>
              )}
            </span>
            <span className={styles.where} key={`w${active}`}>{where}</span>
          </div>
        </div>
      </div>

      <Run
        runRef={runRef}
        chapters={chapters}
        head={head}
        words={words}
        kinds={kinds}
        photosFor={photosFor}
        photosLabel={photosLabel}
        thumbs={thumbs}
        onOpen={setViewer}
        onStop={track}
      />

      <Lightbox
        photos={viewer ? photosFor[viewer.chapter] ?? [] : []}
        index={viewer?.index ?? null}
        originOf={originOf}
        onIndex={(index) => setViewer(v => (v ? { ...v, index } : v))}
        onClose={() => setViewer(null)}
        labels={viewerLabels}
      />
    </div>
  );
};

export default Story;
