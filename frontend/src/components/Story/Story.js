import { useEffect, useRef, useState } from 'react';
import Shape from '../Shape';
import styles from './Story.module.css';

const PALETTE = ['blue', 'green', 'orange', 'pink', 'yellow'];
const KIND_SHAPE = { experience: 'squircle', education: 'circle' };

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

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const lengthOf = (a, b) => {
  if (!a || !b) return null;
  if (a.m === null || b.m === null) {
    const years = b.y - a.y + 1;
    return years > 0 ? plural(years, 'yr') : null;
  }
  const months = (b.y - a.y) * 12 + (b.m - a.m) + 1;
  if (months <= 0) return null;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && plural(y, 'yr'), m && plural(m, 'mo')].filter(Boolean).join(' ');
};

const spanOf = (c) => {
  const start = String(c.start ?? '').trim();
  const end = String(c.end ?? '').trim();
  const now = new Date();
  const current = !c.next && Boolean(start) && !end;
  const a = parseDate(start);
  const b = current ? { y: now.getFullYear(), m: now.getMonth() } : parseDate(end);
  return {
    current,
    next: Boolean(c.next),
    fromYear: c.next ? 'now' : a ? String(a.y) : null,
    toYear: current ? 'now' : b ? String(b.y) : c.next ? 'next' : null,
    fromLabel: c.next ? 'Now' : start || null,
    toLabel: current ? 'Present' : end || (c.next ? 'Next' : null),
    length: c.next ? null : lengthOf(a, b),
    sameYear: Boolean(a && b && !current && !c.next && a.y === b.y && a.m !== null && b.m !== null && a.m !== b.m),
    fromMonth: a?.m ?? null,
    toMonth: b?.m ?? null,
  };
};

const Story = ({ chapters = [], photo, name = '' }) => {
  const sectionRef = useRef(null);
  const ringRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const nodes = [...section.querySelectorAll('[data-chapter]')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(Number(e.target.dataset.chapter));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    nodes.forEach(n => io.observe(n));

    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.5 - r.top) / Math.max(1, r.height - vh * 0.2)));
      section.style.setProperty('--p', p.toFixed(4));
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING * (1 - p));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [chapters.length]);

  if (!chapters.length) return null;

  const current = chapters[active] ?? chapters[0];
  const span = spanOf(current);
  const monthName = (m) => MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1);
  const fromYear = span.sameYear ? monthName(span.fromMonth) : span.fromYear ?? span.toYear ?? String(new Date().getFullYear());
  const toYear = span.sameYear ? monthName(span.toMonth) : span.toYear && span.toYear !== fromYear ? span.toYear : null;
  const where = span.sameYear ? `${current.place}, ${span.fromYear}` : current.place;
  const tags = (current.tags ?? []).slice(0, 6);
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('');
  const colour = PALETTE[active % PALETTE.length];
  const shape = KIND_SHAPE[current.kind] ?? 'star';

  return (
    <div
      ref={sectionRef}
      className={styles.story}
      style={{ '--n': chapters.length, '--cc': `var(--c-${colour})`, '--cc-ink': `var(--c-${colour}-ink)` }}
    >
      <div className={styles.pin}>
        <div className={styles.stage}>
          <div className={styles.figure}>
            <span className={styles.backShape} key={`s${active}`} aria-hidden="true">
              <Shape kind={shape} colour={colour} className={styles.backSvg} />
            </span>
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

            <div className={styles.photo}>
              {photo
                ? <img src={photo} alt="" width="320" height="320" loading="lazy" />
                : <span className={styles.initials}>{initials}</span>}
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
            <span className={styles.range} key={`y${active}`} aria-label={toYear ? `${fromYear} to ${toYear}` : fromYear}>
              <span className={styles.year}>{fromYear}</span>
              {toYear && (
                <>
                  <span className={styles.rangeLine} aria-hidden="true" />
                  <span className={styles.year} data-end data-now={span.current || span.next ? '' : undefined}>{toYear}</span>
                </>
              )}
            </span>
            <span className={styles.where} key={`w${active}`}>{where}</span>
          </div>
        </div>
      </div>

      <ol className={styles.chapters}>
        {chapters.map((c, i) => {
          const sp = spanOf(c);
          return (
            <li
              key={c.id ?? i}
              className={styles.chapter}
              data-chapter={i}
              data-active={i === active ? '' : undefined}
              style={{ '--chapter': `var(--c-${PALETTE[i % PALETTE.length]})`, '--chapter-ink': `var(--c-${PALETTE[i % PALETTE.length]}-ink)` }}
            >
              <div className={styles.chapterInner}>
                <p className={styles.kind}>
                  <span className={styles.kindDot} data-kind={c.kind} aria-hidden="true" />
                  {c.kind}
                </p>
                <h3 className={styles.place}>{c.place}</h3>
                {c.what && <p className={styles.what}>{c.what}</p>}
                {(sp.fromLabel || sp.toLabel) && (
                  <div className={styles.span} data-open={sp.current || sp.next ? '' : undefined}>
                    {sp.fromLabel && (
                      <span className={styles.stop}><small>from</small>{sp.fromLabel}</span>
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
  );
};

export default Story;
