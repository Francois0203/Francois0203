import { useEffect, useRef, useState } from 'react';
import Shape from '../Shape';
import styles from './Story.module.css';

const PALETTE = ['blue', 'green', 'orange', 'pink', 'yellow'];
const KIND_SHAPE = { experience: 'squircle', education: 'circle' };

const RING = 2 * Math.PI * 47;

const yearOf = (period) => {
  const all = String(period ?? '').match(/\b(19|20)\d{2}\b/g);
  if (!all) return null;
  return /present/i.test(String(period)) ? all[0] : all[all.length - 1];
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
  const year = yearOf(current.period) ?? String(new Date().getFullYear());
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
            <span className={styles.year} key={`y${year}`}>{year}</span>
            <span className={styles.where} key={`w${active}`}>{current.place}</span>
          </div>
        </div>
      </div>

      <ol className={styles.chapters}>
        {chapters.map((c, i) => (
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
                {c.kind} <span className={styles.period}>{c.period}</span>
              </p>
              <h3 className={styles.place}>{c.place}</h3>
              {c.what && <p className={styles.what}>{c.what}</p>}
              {c.note && <p className={styles.note}>{c.note}</p>}
              {c.tags?.length > 0 && (
                <ul className={styles.chapterTags}>
                  {c.tags.map(t => <li key={t}>{t}</li>)}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Story;
