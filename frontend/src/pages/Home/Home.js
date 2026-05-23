import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowOutward, MdPerson, MdCode, MdEmail,
  MdAutoStories, MdMenuBook,
} from 'react-icons/md';
import { FaGithub, FaLinkedin, FaLeaf, FaFeatherAlt } from 'react-icons/fa';
import usePortfolioData from '../../hooks/usePortfolioData';
import usePolaroidPhotos from '../../hooks/usePolaroidPhotos';
import { Modal, MagneticButton, CursorGlowButton } from '../../components';
import styles from './Home.module.css';

const POLAROID_MIN = 4;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const itemLabel = (s) =>
  typeof s === 'string' ? s : s?.name ?? s?.title ?? String(s);

const flattenSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills.categories))
    return skills.categories.flatMap(c =>
      (c.items ?? []).map(i => ({ label: itemLabel(i), group: c.name }))
    );
  if (Array.isArray(skills.items))
    return skills.items.map(i => ({ label: itemLabel(i), group: null }));
  return Object.entries(skills)
    .filter(([, v]) => Array.isArray(v))
    .flatMap(([name, arr]) => arr.map(i => ({ label: itemLabel(i), group: name })));
};

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ─── Leaf SVG ─────────────────────────────────────────────────────────────── */

const MapleLeaf = ({ className, style }) => (
  <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
    <path
      d="M32 4 L36 14 L46 9 L42 20 L54 20 L46 28 L58 32 L46 36 L54 44 L42 44 L46 55 L36 50 L32 60 L28 50 L18 55 L22 44 L10 44 L18 36 L6 32 L18 28 L10 20 L22 20 L18 9 L28 14 Z"
      fill="currentColor"
    />
  </svg>
);

/* ─── Drifting motes overlay (fixed) ───────────────────────────────────────── */

const MOTE_COUNT = 8;

const DriftingMotes = () => {
  const motes = useMemo(() => Array.from({ length: MOTE_COUNT }, (_, i) => ({
    i,
    left:     Math.round(Math.random() * 100),
    size:     6  + Math.round(Math.random() * 8),
    duration: 22 + Math.round(Math.random() * 18),
    delay:    -Math.round(Math.random() * 30),
    drift:    (Math.random() * 36 - 18).toFixed(1),
    opacity:  (0.35 + Math.random() * 0.35).toFixed(2),
  })), []);

  return (
    <div className={styles.moteField} aria-hidden="true">
      {motes.map(m => (
        <span
          key={m.i}
          className={styles.mote}
          style={{
            left:               `${m.left}%`,
            width:              `${m.size}px`,
            height:             `${m.size}px`,
            animationDuration:  `${m.duration}s`,
            animationDelay:     `${m.delay}s`,
            '--drift':          `${m.drift}vw`,
            '--moteOpacity':    m.opacity,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Falling autumn leaves overlay (fixed) ────────────────────────────────── */

const LEAF_COUNT = 7;

const FallingLeaves = () => {
  const leaves = useMemo(() => Array.from({ length: LEAF_COUNT }, (_, i) => ({
    i,
    left:     Math.round(Math.random() * 100),
    size:     14 + Math.round(Math.random() * 16),
    duration: 15 + Math.round(Math.random() * 16),
    delay:    -Math.round(Math.random() * 32),
    drift:    (Math.random() * 34 - 17).toFixed(1),
    spin:     Math.random() > 0.5 ? 1 : -1,
    hue:      i % 3,
    opacity:  (0.45 + Math.random() * 0.3).toFixed(2),
  })), []);

  return (
    <div className={styles.leafField} aria-hidden="true">
      {leaves.map(l => (
        <span
          key={l.i}
          className={`${styles.fallingLeaf} ${styles[`leafHue${l.hue}`]}`}
          style={{
            left:              `${l.left}%`,
            width:             `${l.size}px`,
            height:            `${l.size}px`,
            animationDuration: `${l.duration}s`,
            animationDelay:    `${l.delay}s`,
            '--drift':         `${l.drift}vw`,
            '--spin':          l.spin,
            '--leafOpacity':   l.opacity,
          }}
        >
          <MapleLeaf />
        </span>
      ))}
    </div>
  );
};

/* ─── Word-by-word reveal ──────────────────────────────────────────────────── */

const WordReveal = ({ text, inView, className, delay = 0 }) => {
  if (!text) return null;
  return (
    <span className={className}>
      {text.split(' ').map((w, i) => (
        <span
          key={i}
          className={`${styles.word} ${inView ? styles.wordVisible : ''}`}
          style={{ '--wi': i, '--wd': `${delay}s` }}
        >
          {w}&nbsp;
        </span>
      ))}
    </span>
  );
};

/* ─── Chapter cards data ───────────────────────────────────────────────────── */

const CHAPTERS = [
  {
    id: 'bio',
    chapter: 'I',
    title: 'The Storyteller',
    subtitle: 'A life in chapters',
    icon: <MdPerson />,
    to: '/bio',
    accent: 'pumpkin',
    opening: 'Every portfolio has a person behind it. This one is no exception.',
    excerpt:
      'Education, the roles that taught me the most, the languages and tools I picked up along the way — all laid out as a timeline you can walk through.',
    cta: 'Open the Bio',
  },
  {
    id: 'projects',
    chapter: 'II',
    title: 'The Workshop',
    subtitle: 'Things I have built',
    icon: <MdCode />,
    to: '/projects',
    accent: 'maple',
    opening: 'Behind every craftsman is a workshop. Mine lives on GitHub.',
    excerpt:
      'A live look at the repositories I am most proud of — pulled fresh from GitHub, with READMEs you can read without ever leaving the page.',
    cta: 'Step into the workshop',
  },
  {
    id: 'connect',
    chapter: 'III',
    title: 'A Letter',
    subtitle: 'Write to me',
    icon: <MdEmail />,
    to: '/connect',
    accent: 'honey',
    opening: 'Stories are better when shared. So please — write to me.',
    excerpt:
      'A short note, a long story, a job, an idea. Drop a message and it lands directly in my inbox. Or find me on the usual networks.',
    cta: 'Pen a letter',
  },
];

/* ─── Chapter illustrations (inline SVG, no external assets) ───────────────── */

const ChapterArt = ({ kind }) => {
  if (kind === 'bio') {
    return (
      <svg viewBox="0 0 200 220" className={styles.chapterArtSvg} aria-hidden="true">
        {/* Stack of books with leaves */}
        <defs>
          <linearGradient id="b1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="var(--accent-1)" />
            <stop offset="100%" stopColor="var(--accent-3)" />
          </linearGradient>
          <linearGradient id="b2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="var(--accent-2)" />
            <stop offset="100%" stopColor="var(--accent-1)" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="195" rx="78" ry="8" fill="rgba(0,0,0,0.18)" />
        <rect x="34"  y="150" width="132" height="34" rx="3" fill="url(#b1)" />
        <rect x="40"  y="156" width="120" height="3"  fill="rgba(255,255,255,0.25)" />
        <rect x="44"  y="112" width="116" height="38" rx="3" fill="url(#b2)" transform="rotate(-2 100 130)" />
        <rect x="50"  y="118" width="104" height="3"  fill="rgba(255,255,255,0.25)" transform="rotate(-2 100 119)" />
        <rect x="50"  y="74"  width="100" height="38" rx="3" fill="url(#b1)" transform="rotate(3 100 92)" />
        <rect x="55"  y="80"  width="90"  height="3"  fill="rgba(255,255,255,0.25)" transform="rotate(3 100 82)" />
        {/* leaf perched on top */}
        <g transform="translate(112,52) rotate(20)">
          <path
            d="M0 0 L4 10 L14 7 L11 18 L21 19 L15 26 L24 30 L15 33 L20 41 L11 39 L13 50 L4 45 L0 54 L-4 45 L-13 50 L-11 39 L-20 41 L-15 33 L-24 30 L-15 26 L-21 19 L-11 18 L-14 7 L-4 10 Z"
            fill="var(--leaf-color)"
          />
        </g>
        {/* bookmark */}
        <rect x="142" y="74" width="6" height="42" fill="var(--accent-2)" />
      </svg>
    );
  }
  if (kind === 'projects') {
    return (
      <svg viewBox="0 0 200 220" className={styles.chapterArtSvg} aria-hidden="true">
        <defs>
          <linearGradient id="p1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--accent-2)" />
            <stop offset="100%" stopColor="var(--accent-1)" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="200" rx="80" ry="7" fill="rgba(0,0,0,0.18)" />
        {/* Workbench */}
        <rect x="24" y="160" width="152" height="34" rx="3" fill="var(--accent-3)" />
        <rect x="24" y="160" width="152" height="6"  fill="rgba(255,255,255,0.18)" />
        {/* Monitor */}
        <rect x="60" y="60" width="90" height="64" rx="4" fill="url(#p1)" stroke="var(--accent-3)" strokeWidth="2" />
        <rect x="68" y="68" width="74" height="48" rx="2" fill="rgba(0,0,0,0.25)" />
        {/* Code lines */}
        <rect x="72" y="74" width="36" height="3" rx="1.5" fill="var(--accent-2)" />
        <rect x="72" y="82" width="58" height="3" rx="1.5" fill="rgba(255,255,255,0.55)" />
        <rect x="80" y="90" width="44" height="3" rx="1.5" fill="rgba(255,255,255,0.40)" />
        <rect x="80" y="98" width="28" height="3" rx="1.5" fill="var(--accent-2)" />
        <rect x="72" y="106" width="52" height="3" rx="1.5" fill="rgba(255,255,255,0.40)" />
        {/* Stand */}
        <rect x="92" y="124" width="26" height="14" fill="var(--accent-3)" />
        <rect x="80" y="138" width="50" height="6" rx="2" fill="var(--accent-1)" />
        {/* Mug */}
        <path d="M30 138 L52 138 L50 158 L32 158 Z" fill="var(--accent-1)" />
        <path d="M52 142 Q60 144 60 150 Q60 156 52 156" stroke="var(--accent-1)" strokeWidth="3" fill="none" />
        <path d="M36 132 Q41 124 46 132" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
        {/* Leaf on workbench */}
        <g transform="translate(150,150) rotate(-25)">
          <path
            d="M0 0 C -3 6 -10 5 -11 11 C -16 12 -16 18 -12 20 C -16 23 -14 28 -9 28 C -9 33 -4 35 0 32 C 4 35 9 33 9 28 C 14 28 16 23 12 20 C 16 18 16 12 11 11 C 10 5 3 6 0 0 Z"
            fill="var(--leaf-color)"
          />
        </g>
      </svg>
    );
  }
  /* connect */
  return (
    <svg viewBox="0 0 200 220" className={styles.chapterArtSvg} aria-hidden="true">
      <defs>
        <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--background-1)" />
          <stop offset="100%" stopColor="var(--accent-2-background)" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="195" rx="76" ry="7" fill="rgba(0,0,0,0.18)" />
      {/* Envelope */}
      <rect x="30" y="70" width="140" height="100" rx="6" fill="url(#c1)" stroke="var(--accent-3)" strokeWidth="2" />
      <path d="M30 76 L100 130 L170 76" fill="none" stroke="var(--accent-3)" strokeWidth="2" />
      <path d="M30 170 L82 124" stroke="var(--accent-3)" strokeWidth="2" fill="none" />
      <path d="M170 170 L118 124" stroke="var(--accent-3)" strokeWidth="2" fill="none" />
      {/* Wax seal */}
      <circle cx="100" cy="140" r="18" fill="var(--leaf-color)" />
      <circle cx="100" cy="140" r="18" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      <path
        d="M100 132 L102 138 L108 138 L103 142 L105 148 L100 144 L95 148 L97 142 L92 138 L98 138 Z"
        fill="rgba(255,255,255,0.65)"
      />
      {/* Feather quill */}
      <g transform="translate(150,40) rotate(35)">
        <path d="M0 0 Q 6 -30 -2 -56 Q -10 -30 -4 0 Z" fill="var(--accent-2)" />
        <line x1="-1" y1="-2" x2="3" y2="-50" stroke="var(--accent-3)" strokeWidth="1" />
        <line x1="-1" y1="0" x2="14" y2="36" stroke="var(--accent-3)" strokeWidth="2" />
      </g>
      {/* leaf */}
      <g transform="translate(40,40) rotate(-20)">
        <path
          d="M0 0 L3 7 L10 5 L8 13 L15 13 L11 19 L17 22 L11 24 L14 29 L8 28 L9 36 L3 33 L0 39 L-3 33 L-9 36 L-8 28 L-14 29 L-11 24 L-17 22 L-11 19 L-15 13 L-8 13 L-10 5 L-3 7 Z"
          fill="var(--leaf-color)"
        />
      </g>
    </svg>
  );
};

/* ─── Coverflow chapter carousel ───────────────────────────────────────────── */

const ChapterCarousel = ({ chapters, onOpen }) => {
  const [current, setCurrent] = useState(0);
  const total = chapters.length;
  const lockRef = useRef(false);

  const goTo = useCallback((idx) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setCurrent(((idx % total) + total) % total);
    setTimeout(() => { lockRef.current = false; }, 480);
  }, [total]);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* Keyboard */
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(chapters[current]); }
  };

  /* Touch / swipe */
  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchX.current == null) return;
    const d = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 38) (d > 0 ? goNext : goPrev)();
    touchX.current = null;
  };

  /* Offset → coverflow style */
  const slideStyle = (offset) => {
    const abs = Math.abs(offset);
    const sign = Math.sign(offset);
    if (abs > 2) return { opacity: 0, pointerEvents: 'none', visibility: 'hidden' };
    if (abs === 0) return {
      transform: 'translateX(0) scale(1) rotateY(0deg)',
      opacity: 1, zIndex: 4, filter: 'none',
    };
    if (abs === 1) return {
      transform: `translateX(${sign * 58}%) scale(0.82) rotateY(${-sign * 22}deg)`,
      opacity: 0.85, zIndex: 3,
      filter: 'brightness(0.78) saturate(0.9)',
      cursor: 'pointer',
    };
    return {
      transform: `translateX(${sign * 96}%) scale(0.66) rotateY(${-sign * 32}deg)`,
      opacity: 0.45, zIndex: 2,
      filter: 'brightness(0.6) saturate(0.7) blur(1px)',
      cursor: 'pointer',
    };
  };

  return (
    <div
      className={styles.coverflow}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Choose a chapter"
    >
      <button
        className={`${styles.coverArrow} ${styles.coverArrowPrev}`}
        onClick={goPrev}
        aria-label="Previous chapter"
        type="button"
      >‹</button>

      <div className={styles.coverStage}>
        {chapters.map((c, idx) => {
          let off = idx - current;
          if (off >  total / 2) off -= total;
          if (off < -total / 2) off += total;
          const isActive = off === 0;
          return (
            <div
              key={c.id}
              className={`${styles.coverCard} ${styles[`accent_${c.accent}`]} ${isActive ? styles.coverCardActive : ''}`}
              style={slideStyle(off)}
              onClick={() => (isActive ? onOpen(c) : goTo(idx))}
              role="group"
              aria-roledescription="slide"
              aria-label={`Chapter ${c.chapter}: ${c.title}`}
            >
              <span className={styles.coverChapter}>Ch. {c.chapter}</span>
              <span className={styles.coverIcon} aria-hidden="true">{c.icon}</span>

              <div className={styles.coverArtFrame}>
                <ChapterArt kind={c.id} />
                <div className={styles.coverArtGloss} aria-hidden="true" />
              </div>

              <div className={styles.coverMeta}>
                <h3 className={styles.coverTitle}>{c.title}</h3>
                <p className={styles.coverSubtitle}>{c.subtitle}</p>
              </div>

              {isActive && (
                <div className={styles.coverOpen}>
                  <span>Open chapter</span>
                  <MdArrowOutward aria-hidden="true" />
                </div>
              )}

              <div className={styles.coverSpine} aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <button
        className={`${styles.coverArrow} ${styles.coverArrowNext}`}
        onClick={goNext}
        aria-label="Next chapter"
        type="button"
      >›</button>

      <div className={styles.coverDots} role="tablist" aria-label="Chapter indicators">
        {chapters.map((c, idx) => (
          <button
            key={c.id}
            className={`${styles.coverDot} ${idx === current ? styles.coverDotActive : ''}`}
            onClick={() => goTo(idx)}
            role="tab"
            aria-selected={idx === current}
            aria-label={`Go to chapter ${c.chapter}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Journey milestones ───────────────────────────────────────────────────── */

const Journey = ({ stops, onSelect }) => {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className={`${styles.journey} ${inView ? styles.journeyVisible : ''}`}>
      {/* Decorative path */}
      <svg className={styles.journeyPath} viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M 20 110 C 180 30, 280 180, 440 100 S 720 30, 880 130 S 980 80, 990 90"
          fill="none"
          stroke="var(--accent-1)"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      <ol className={styles.journeyList}>
        {stops.map((s, i) => (
          <li
            key={s.id ?? i}
            className={styles.journeyItem}
            style={{ '--ji': i }}
          >
            <button
              type="button"
              className={styles.journeyDot}
              onClick={() => onSelect(s)}
              aria-label={`${s.title} — ${s.period ?? ''}`}
            >
              <span className={styles.journeyDotInner} />
              <span className={styles.journeyDotPulse} aria-hidden="true" />
            </button>
            <div className={styles.journeyLabel}>
              <span className={styles.journeyPeriod}>{s.period ?? '—'}</span>
              <span className={styles.journeyTitle}>{s.title}</span>
              {s.subtitle && <span className={styles.journeySubtitle}>{s.subtitle}</span>}
            </div>
          </li>
        ))}
      </ol>

      {stops.length === 0 && (
        <p className={styles.journeyEmpty}>The journey is being written…</p>
      )}
    </div>
  );
};

/* ─── Side-peek polaroid ───────────────────────────────────────────────────── */

const PolaroidCard = ({ src, index, onOpen }) => {
  const rot = (((index * 13) % 11) - 5).toFixed(1);
  return (
    <button
      type="button"
      className={styles.polaroid}
      style={{ '--pr': `${rot}deg`, '--pi': index }}
      onClick={() => onOpen({ src, index })}
      aria-label={`Open memento ${index + 1}`}
    >
      <span className={styles.polaroidTape} aria-hidden="true" />
      <span className={styles.polaroidLeaf} aria-hidden="true">
        <MapleLeaf />
      </span>
      <span className={styles.polaroidPhotoWrap}>
        <img
          src={src}
          alt={`Memento ${index + 1}`}
          className={styles.polaroidImg}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </span>
      <span className={styles.polaroidCaption}>No. {index + 1}</span>
    </button>
  );
};

const PolaroidSkel = ({ index }) => {
  const rot = (((index * 13) % 11) - 5).toFixed(1);
  return (
    <span
      className={`${styles.polaroid} ${styles.polaroidSkel}`}
      style={{ '--pr': `${rot}deg`, '--pi': index }}
      aria-hidden="true"
    >
      <span className={styles.polaroidTape} />
      <span className={styles.polaroidPhotoWrap}>
        <span className={styles.polaroidImgSkel} />
      </span>
      <span className={styles.polaroidCaptionSkel} />
    </span>
  );
};

const SidePolaroid = ({ src, index, side, onOpen, loading = false }) => {
  const [ref, inView] = useInView(0.05);
  return (
    <div
      ref={ref}
      className={`${styles.sidePolaroidWrap} ${styles[`side_${side}`]} ${inView ? styles.sidePolaroidIn : ''}`}
      aria-hidden={loading ? 'true' : undefined}
    >
      {loading
        ? <PolaroidSkel index={index} />
        : <PolaroidCard src={src} index={index} onOpen={onOpen} />
      }
    </div>
  );
};

/* ─── Pile of skill leaves ─────────────────────────────────────────────────── */

const SkillPile = ({ skills }) => {
  const [ref, inView] = useInView(0.10);
  if (skills.length === 0) return null;
  return (
    <div ref={ref} className={`${styles.pile} ${inView ? styles.pileVisible : ''}`}>
      {skills.map((s, i) => (
        <span
          key={i}
          className={styles.skillLeaf}
          style={{
            '--si': i,
            '--rot': `${((i * 13) % 5) - 2}deg`,
          }}
        >
          <FaLeaf className={styles.skillLeafIcon} aria-hidden="true" />
          {s.label}
        </span>
      ))}
    </div>
  );
};

/* ─── Helper: derive journey from experience + education ───────────────────── */

const toJourney = ({ experience = [], education = [] }) => {
  const ex = experience.map(e => ({
    id:       `exp-${e.id}`,
    title:    e.company || e.employer || e.organisation || 'Role',
    subtitle: e.role || e.position || e.title,
    period:   e.period || e.dates || (e.start ? `${e.start}${e.end ? ` – ${e.end}` : ' – Present'}` : null),
    description: e.description || e.summary,
    tags:     e.tech || e.technologies || e.stack || e.tags,
    kind:     'experience',
    order:    e.order ?? 0,
  }));
  const ed = education.map(e => ({
    id:       `edu-${e.id}`,
    title:    e.institution || e.school || e.university || 'Education',
    subtitle: [e.degree || e.qualification, e.field || e.major].filter(Boolean).join(' — '),
    period:   e.period || e.dates || (e.start ? `${e.start}${e.end ? ` – ${e.end}` : ' – Present'}` : null),
    description: e.description || e.summary,
    tags:     e.tags,
    kind:     'education',
    order:    e.order ?? 0,
  }));
  return [...ex, ...ed].sort((a, b) => a.order - b.order);
};

/* ─── Main page ───────────────────────────────────────────────────────────── */

const Home = () => {
  const { data, loading } = usePortfolioData();
  const { photos, loading: photosLoading } = usePolaroidPhotos();
  const navigate = useNavigate();
  const pageRef  = useRef(null);

  const [openChapter,   setOpenChapter]   = useState(null);
  const [openMilestone, setOpenMilestone] = useState(null);
  const [openPolaroid,  setOpenPolaroid]  = useState(null);

  /* Polaroid slot helper: when photos are loading show 4 skeletons; when loaded
     show the actual photo (if we have at least POLAROID_MIN); when loaded with
     fewer than the minimum, render nothing. */
  const polaroidSlot = (slotIndex) => {
    const side = slotIndex % 2 === 0 ? 'right' : 'left';
    if (photosLoading && slotIndex < POLAROID_MIN) {
      return <SidePolaroid key={`skel-${slotIndex}`} index={slotIndex} side={side} loading />;
    }
    if (!photosLoading && photos.length >= POLAROID_MIN && photos[slotIndex]) {
      return (
        <SidePolaroid
          key={photos[slotIndex]}
          src={photos[slotIndex]}
          index={slotIndex}
          side={side}
          onOpen={setOpenPolaroid}
        />
      );
    }
    return null;
  };

  /* Cursor warm-spot — skip entirely on touch / coarse pointers */
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    if (typeof window === 'undefined') return;
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const small  = window.matchMedia('(max-width: 768px)').matches;
    if (coarse || small) return;

    let raf = 0;
    let lastX = 0, lastY = 0;
    const apply = () => {
      raf = 0;
      page.style.setProperty('--cx', `${lastX}px`);
      page.style.setProperty('--cy', `${lastY}px`);
    };
    const onMove = (e) => {
      lastX = e.clientX; lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Refs for scene reveals */
  const [coverRef,   coverInView]   = useInView(0.20);
  const [chapterRef, chapterInView] = useInView(0.10);
  const [journeyRef, journeyInView] = useInView(0.10);
  const [pileSecRef, pileSecInView] = useInView(0.10);
  const [endRef,     endInView]     = useInView(0.20);

  const personal   = data?.personal ?? {};
  const social     = data?.social   ?? [];
  const skills     = flattenSkills(data?.skills);
  const journey    = useMemo(() => toJourney(data ?? {}), [data]);
  const github     = social.find(s => (s.key || '').toLowerCase() === 'github');
  const linkedin   = social.find(s => (s.key || '').toLowerCase() === 'linkedin');
  const githubUser = github?.url?.replace(/\/$/, '').split('/').pop() ?? null;
  const photoUrl   = personal.photoUrl || (githubUser ? `https://github.com/${githubUser}.png` : null);

  const opening = personal.bio
    ?? personal.summary
    ?? 'Welcome, traveler. Pull up a chair, pour something warm, and let me tell you who I am.';

  return (
    <div
      ref={pageRef}
      className={styles.page}
      style={{ '--cx': '-500px', '--cy': '-500px' }}
    >
      {/* Atmospheric layers */}
      <div className={styles.warmSpot} aria-hidden="true" />
      <div className={styles.parchment} aria-hidden="true" />
      <div className={styles.coffeeStains} aria-hidden="true" />
      <DriftingMotes />
      <FallingLeaves />

      {/* ── Scene 1 ── Cover ──────────────────────────────────────────── */}
      <div className={`${styles.sceneFrame} ${styles.sceneFrame_cover}`}>
      <section ref={coverRef} className={styles.cover}>

        <div className={styles.coverFlourish} aria-hidden="true">
          <FaFeatherAlt />
          <span className={styles.coverFlourishLine} />
        </div>

        <p className={styles.coverEyebrow}>Prologue</p>

        <h1 className={styles.coverTitleLine}>
          <span className={styles.coverTitleSerif}>the portfolio of</span>
          {loading
            ? <span className={`${styles.coverTitleSkel} ${styles.shimmerBar}`} aria-hidden="true" />
            : (
              <span className={styles.coverTitleScript}>
                {personal.name ?? 'a friendly stranger'}
              </span>
            )
          }
        </h1>

        {loading
          ? (
            <p className={styles.coverByline} aria-hidden="true">
              <span className={`${styles.coverBySkel} ${styles.shimmerBar}`} />
            </p>
          )
          : (
            <p className={styles.coverByline}>
              <span className={styles.coverByLabel}>a collection of chapters</span>
              {personal.title && (
                <>
                  <span className={styles.coverByDot} aria-hidden="true">·</span>
                  <span className={styles.coverByRole}>{personal.title}</span>
                </>
              )}
            </p>
          )
        }

        <div className={styles.coverDivider} aria-hidden="true">
          <MapleLeaf className={styles.coverDividerLeaf} />
        </div>

        {loading
          ? (
            <div className={styles.coverOpeningSkel} aria-hidden="true">
              <span className={`${styles.openingLine} ${styles.shimmerBar}`} />
              <span className={`${styles.openingLine} ${styles.shimmerBar}`} style={{ width: '94%' }} />
              <span className={`${styles.openingLine} ${styles.shimmerBar}`} style={{ width: '78%' }} />
            </div>
          )
          : (
            <div className={styles.coverOpening}>
              <span className={styles.coverDropcap}>P</span>
              <WordReveal
                text={`ull up a chair, pour something warm. ${opening}`}
                inView={coverInView}
                className={styles.coverProse}
                delay={0.2}
              />
            </div>
          )
        }

        {/* Portrait + invitation */}
        <div className={styles.coverPortraitRow}>
          {(loading || photoUrl) && (
            <div className={styles.coverPortrait}>
              {loading
                ? <span className={styles.coverPortraitSkel} />
                : (
                  <>
                    <img src={photoUrl} alt={personal.name ?? 'Profile'} className={styles.coverPortraitImg} />
                    <span className={styles.coverPortraitRing} aria-hidden="true" />
                    <span className={styles.coverPortraitLeaf} aria-hidden="true">
                      <MapleLeaf />
                    </span>
                  </>
                )
              }
            </div>
          )}

          <div className={styles.coverInvite}>
            <p className={styles.coverInviteText}>
              Three chapters wait below. Turn the page whenever you’re ready.
            </p>
            <div className={styles.coverCtas}>
              <MagneticButton onClick={() => navigate('/bio')}>
                Begin reading <MdAutoStories aria-hidden="true" />
              </MagneticButton>
              <CursorGlowButton onClick={() => navigate('/projects')}>
                Browse the workshop
              </CursorGlowButton>
            </div>

            {!loading && (github || linkedin) && (
              <div className={styles.coverSocials}>
                {github && (
                  <a href={github.url} target="_blank" rel="noopener noreferrer" className={styles.coverSocialLink}>
                    <FaGithub aria-hidden="true" />
                    GitHub
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin.url} target="_blank" rel="noopener noreferrer" className={styles.coverSocialLink}>
                    <FaLinkedin aria-hidden="true" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.coverScrollHint} aria-hidden="true">
          <span>Turn the page</span>
          <span className={styles.coverScrollLine}><span className={styles.coverScrollDot} /></span>
        </div>
      </section>

      {/* Photo peek beside the Cover */}
      {polaroidSlot(0)}
      </div>

      {/* ── Scene 2 ── Chapter Carousel ───────────────────────────────── */}
      <div className={`${styles.sceneFrame} ${styles.sceneFrame_chapters}`}>
      <section ref={chapterRef} className={`${styles.scene} ${styles.sceneChapters} ${chapterInView ? styles.sceneVisible : ''}`}>
        <div className={styles.sceneHead}>
          <span className={styles.sceneEye}>Chapter I</span>
          <h2 className={styles.sceneTitle}>Choose your chapter</h2>
          <p className={styles.sceneLede}>
            Three covers, three short stories. Tap one to peek inside; open it to read in full.
          </p>
        </div>

        <ChapterCarousel chapters={CHAPTERS} onOpen={setOpenChapter} />
      </section>

      {/* Photo peek beside the Chapter carousel */}
      {polaroidSlot(1)}
      </div>

      {/* ── Scene 3 ── The Journey ────────────────────────────────────── */}
      <div className={`${styles.sceneFrame} ${styles.sceneFrame_journey}`}>
      <section ref={journeyRef} className={`${styles.scene} ${journeyInView ? styles.sceneVisible : ''}`}>
        <div className={styles.sceneHead}>
          <span className={styles.sceneEye}>Chapter II</span>
          <h2 className={styles.sceneTitle}>The journey so far</h2>
          <p className={styles.sceneLede}>
            A meandering path of schools, jobs, and small obsessions. Press a milestone to read its page.
          </p>
        </div>

        {loading
          ? <div className={styles.journeySkel}>{[0,1,2,3].map(i =>
              <span key={i} className={styles.journeySkelDot} />
            )}</div>
          : <Journey stops={journey} onSelect={setOpenMilestone} />
        }
      </section>

      {/* Photo peek beside the Journey */}
      {polaroidSlot(2)}
      </div>

      {/* ── Scene 4 ── The Toolkit ────────────────────────────────────── */}
      <div className={`${styles.sceneFrame} ${styles.sceneFrame_toolkit}`}>
      {(loading || skills.length > 0) && (
        <section ref={pileSecRef} className={`${styles.scene} ${pileSecInView ? styles.sceneVisible : ''}`}>
          <div className={styles.sceneHead}>
            <span className={styles.sceneEye}>Chapter III</span>
            <h2 className={styles.sceneTitle}>The toolkit</h2>
            <p className={styles.sceneLede}>
              The tools I gather along the way — pinned here like pressed leaves.
            </p>
          </div>

          {loading
            ? (
              <div className={styles.pile}>
                {[72, 56, 88, 64, 80, 92, 50, 68].map((w, i) => (
                  <span key={i} className={styles.skillLeafSkel} style={{ width: w }} />
                ))}
              </div>
            )
            : <SkillPile skills={skills} />
          }
        </section>
      )}

      {/* Photo peek beside the Toolkit */}
      {polaroidSlot(3)}
      </div>

      {/* Extras: any photos beyond the first 4 fall in here */}
      {!photosLoading && photos.length > POLAROID_MIN && (
        photos.slice(POLAROID_MIN).map((src, j) => {
          const i = j + POLAROID_MIN;
          return (
            <SidePolaroid
              key={src}
              src={src}
              index={i}
              side={i % 2 === 0 ? 'right' : 'left'}
              onOpen={setOpenPolaroid}
            />
          );
        })
      )}

      {/* ── Scene 5 ── Epilogue ───────────────────────────────────────── */}
      <section ref={endRef} className={`${styles.scene} ${styles.sceneEnd} ${endInView ? styles.sceneVisible : ''}`}>
        <div className={styles.endCard}>
          <span className={styles.endOrnament} aria-hidden="true">
            <MapleLeaf />
            <span className={styles.endOrnamentLine} />
            <MapleLeaf />
          </span>
          <h2 className={styles.endTitle}>The End… <em>or just the beginning?</em></h2>
          <p className={styles.endText}>
            That is the prologue. The full story lives in three chapters, and they would love a reader.
            Pick one, or send word and we’ll write the next page together.
          </p>
          <div className={styles.endCtas}>
            <MagneticButton onClick={() => navigate('/bio')}>
              <MdMenuBook aria-hidden="true" /> Read the Bio
            </MagneticButton>
            <MagneticButton onClick={() => navigate('/projects')}>
              <MdCode aria-hidden="true" /> See projects
            </MagneticButton>
            <CursorGlowButton onClick={() => navigate('/connect')}>
              <MdEmail aria-hidden="true" /> Write a letter
            </CursorGlowButton>
          </div>
        </div>
      </section>

      <div className={styles.pageFade} aria-hidden="true" />

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <Modal open={!!openChapter} onClose={() => setOpenChapter(null)} title={openChapter ? `Chapter ${openChapter.chapter} · ${openChapter.title}` : ''} size="md">
        {openChapter && (
          <div className={styles.chapterModal}>
            <div className={`${styles.chapterModalArt} ${styles[`accent_${openChapter.accent}`]}`}>
              <ChapterArt kind={openChapter.id} />
            </div>
            <p className={styles.chapterModalOpening}>{openChapter.opening}</p>
            <p className={styles.chapterModalExcerpt}>{openChapter.excerpt}</p>
            <div className={styles.chapterModalActions}>
              <MagneticButton onClick={() => { setOpenChapter(null); navigate(openChapter.to); }}>
                {openChapter.cta} <MdArrowOutward aria-hidden="true" />
              </MagneticButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!openMilestone} onClose={() => setOpenMilestone(null)} title={openMilestone?.title} size="md">
        {openMilestone && (
          <div className={styles.milestoneModal}>
            <span className={`${styles.milestoneKind} ${styles[`milestoneKind_${openMilestone.kind}`]}`}>
              {openMilestone.kind === 'education' ? 'Education' : 'Experience'}
            </span>
            {openMilestone.subtitle && <p className={styles.milestoneSub}>{openMilestone.subtitle}</p>}
            {openMilestone.period   && <p className={styles.milestonePeriod}>{openMilestone.period}</p>}
            {openMilestone.description && <p className={styles.milestoneDesc}>{openMilestone.description}</p>}
            {openMilestone.tags?.length > 0 && (
              <div className={styles.milestoneTags}>
                {openMilestone.tags.map((t, i) => (
                  <span key={i} className={styles.milestoneTag}>{t}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!openPolaroid}
        onClose={() => setOpenPolaroid(null)}
        title={openPolaroid ? `Memento No. ${openPolaroid.index + 1}` : ''}
        size="lg"
      >
        {openPolaroid && (
          <div className={styles.lightbox}>
            <img
              src={openPolaroid.src}
              alt={`Memento ${openPolaroid.index + 1}`}
              className={styles.lightboxImg}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
