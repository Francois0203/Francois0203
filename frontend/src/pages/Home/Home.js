import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowOutward, MdPerson, MdCode, MdEmail } from 'react-icons/md';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import usePortfolioData from '../../hooks/usePortfolioData';
import { MagneticButton, CursorGlowButton } from '../../components';
import styles from './Home.module.css';

const itemLabel = (s) => (typeof s === 'string' ? s : s?.name ?? s?.title ?? String(s));

const flattenSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills.categories))
    return skills.categories.flatMap(c => (c.items ?? []).map(itemLabel));
  if (Array.isArray(skills.items)) return skills.items.map(itemLabel);
  return Object.values(skills).filter(Array.isArray).flatMap(arr => arr.map(itemLabel));
};

const useInView = (threshold = 0.12) => {
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

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';

const useScramble = (text, { delay = 250, duration = 1500 } = {}) => {
  const [output, setOutput]   = useState('');
  const [settled, setSettled] = useState(false);
  const rafRef   = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    const noAnim = document.documentElement.getAttribute('data-no-animations') === 'true'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noAnim) { setOutput(text); setSettled(true); return; }
    let startTime = null;
    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / duration, 1);
      const revealed = Math.floor(t * text.length);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        if (i < revealed || text[i] === ' ') result += text[i];
        else result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setOutput(result);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else { setOutput(text); setSettled(true); }
    };
    timerRef.current = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current); };
  }, [text, delay, duration]);

  return { output, settled };
};

const useCounter = (target, { duration = 1400, inView } = {}) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!inView || !target) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, inView]);
  return count;
};

const WordReveal = ({ text, inView, className }) => {
  if (!text) return null;
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className={`${styles.word} ${inView ? styles.wordVisible : ''}`}
          style={{ '--wi': i }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
};

const Skel = ({ w, h = '0.9rem', r }) => (
  <span className={styles.skel} style={{ width: w, height: h, borderRadius: r }} />
);

const Stat = ({ value, suffix = '', label, inView, loading }) => {
  const count = useCounter(value, { inView });
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>
        {loading ? <Skel w="40px" h="1.8rem" r="var(--radius-sm)" /> : <>{count}{suffix}</>}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
};

const TiltCard = ({ icon, title, desc, onClick, index }) => {
  const cardRef = useRef(null);

  const onMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
    const y = ((e.clientY - r.top)   / r.height - 0.5) * 2;
    el.style.setProperty('--rx',  `${-y * 11}deg`);
    el.style.setProperty('--ry',  `${x * 11}deg`);
    el.style.setProperty('--gx',  `${(x * 0.5 + 0.5) * 100}%`);
    el.style.setProperty('--gy',  `${(y * 0.5 + 0.5) * 100}%`);
    el.style.setProperty('--sop', '1');
  }, []);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx',  '0deg');
    el.style.setProperty('--ry',  '0deg');
    el.style.setProperty('--sop', '0');
  }, []);

  return (
    <div className={styles.cardWrap} style={{ '--i': index }}>
      <button
        ref={cardRef}
        className={styles.navCard}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        aria-label={`Go to ${title}`}
      >
        <span className={styles.cardSweep} aria-hidden="true" />
        <span className={styles.navIcon} aria-hidden="true">{icon}</span>
        <span className={styles.navTitle}>{title}</span>
        <span className={styles.navDesc}>{desc}</span>
        <MdArrowOutward className={styles.navArrow} aria-hidden="true" />
        <span className={styles.cardSpot} aria-hidden="true" />
      </button>
    </div>
  );
};

const NAV_ITEMS = [
  { icon: <MdPerson />, title: 'Bio',      desc: 'Experience, education & skills', to: '/bio'      },
  { icon: <MdCode   />, title: 'Projects', desc: 'Open-source work on GitHub',     to: '/projects' },
  { icon: <MdEmail  />, title: 'Connect',  desc: 'Get in touch or send a message', to: '/connect'  },
];

const Home = () => {
  const { data, loading } = usePortfolioData();
  const navigate = useNavigate();
  const pageRef  = useRef(null);

  // Cursor spotlight
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    let raf;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        page.style.setProperty('--cx', `${e.clientX}px`);
        page.style.setProperty('--cy', `${e.clientY}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  const personal   = data?.personal ?? {};
  const social     = data?.social   ?? [];
  const skills     = flattenSkills(data?.skills);
  const github     = social.find(s => (s.key || '').toLowerCase() === 'github');
  const linkedin   = social.find(s => (s.key || '').toLowerCase() === 'linkedin');
  const githubUser = github?.url?.replace(/\/$/, '').split('/').pop() ?? null;
  const photoUrl   = personal.photoUrl || (githubUser ? `https://github.com/${githubUser}.png` : null);

  const { output: scrambledName, settled } = useScramble(
    !loading ? (personal.name ?? '') : '',
    { delay: 200, duration: 1500 }
  );

  const skillCount = skills.length;
  const expCount   = (data?.experience ?? []).length;
  const projCount  = (data?.projects   ?? []).length;

  const [statsRef,  statsInView]  = useInView(0.25);
  const [cardsRef,  cardsInView]  = useInView(0.08);
  const [tickerRef, tickerInView] = useInView(0.05);

  return (
    <div
      ref={pageRef}
      className={styles.page}
      style={{ '--cx': '-500px', '--cy': '-500px' }}
    >
      <div className={styles.cursorSpot} aria-hidden="true" />

      <div className={styles.blobField} aria-hidden="true">
        <div className={`${styles.blob} ${styles.b1}`} />
        <div className={`${styles.blob} ${styles.b2}`} />
      </div>

      <div className={styles.dotGrid} aria-hidden="true" />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>

          {/* Left: copy */}
          <div className={styles.heroLeft}>

            <div className={styles.availBadge} style={{ '--d': '0s' }}>
              <span className={styles.availDotWrap} aria-hidden="true">
                <span className={styles.availRing} />
                <span className={styles.availDot} />
              </span>
              Available for Work
            </div>

            <div className={styles.nameBlock} style={{ '--d': '0.10s' }}>
              <p className={styles.heroGreet}>Hello, I'm</p>
              {loading
                ? <Skel w="min(380px, 82vw)" h="clamp(2.8rem, 7vw, 5.5rem)" r="var(--radius-md)" />
                : (
                  <h1
                    className={`${styles.heroName} ${settled ? styles.nameSettled : ''}`}
                    aria-label={personal.name ?? 'Portfolio'}
                  >
                    {scrambledName || ' '}
                  </h1>
                )
              }
            </div>

            {(loading || personal.title) && (
              <div className={styles.titleBlock} style={{ '--d': '0.18s' }}>
                {loading
                  ? <Skel w="200px" h="1.5rem" r="var(--radius-sm)" />
                  : (
                    <>
                      <span className={styles.titleAccent} aria-hidden="true" />
                      <p className={styles.heroTitle}>{personal.title}</p>
                    </>
                  )
                }
              </div>
            )}

            {(loading || personal.bio || personal.summary) && (
              <div className={styles.bioWrap} style={{ '--d': '0.26s' }}>
                {loading
                  ? (
                    <div className={styles.skelStack}>
                      <Skel w="min(460px, 84vw)" h="0.9rem" r="var(--radius-sm)" />
                      <Skel w="min(320px, 64vw)" h="0.9rem" r="var(--radius-sm)" />
                    </div>
                  )
                  : (
                    <WordReveal
                      text={personal.bio ?? personal.summary ?? ''}
                      inView={settled}
                      className={styles.heroBio}
                    />
                  )
                }
              </div>
            )}

            <div className={styles.ctas} style={{ '--d': '0.34s' }}>
              <MagneticButton onClick={() => navigate('/projects')}>
                View Projects <MdArrowOutward aria-hidden="true" />
              </MagneticButton>
              <CursorGlowButton onClick={() => navigate('/bio')}>
                About Me
              </CursorGlowButton>
            </div>

            {!loading && (github || linkedin) && (
              <div className={styles.socials} style={{ '--d': '0.42s' }}>
                {github && (
                  <a href={github.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <FaGithub aria-hidden="true" />
                    GitHub
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <FaLinkedin aria-hidden="true" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: portrait card + stats */}
          <div className={styles.heroRight}>

            {(loading || photoUrl) && (
              <div className={styles.photoCard}>
                {loading
                  ? <span className={`${styles.skel} ${styles.photoSkel}`} />
                  : (
                    <>
                      <img src={photoUrl} alt={personal.name ?? 'Profile'} className={styles.photoImg} />
                      <div className={styles.photoSheen} aria-hidden="true" />
                      {(personal.name || personal.title) && (
                        <div className={styles.photoCaption}>
                          {personal.name  && <span className={styles.photoCaptionName}>{personal.name}</span>}
                          {personal.title && <span className={styles.photoCaptionRole}>{personal.title}</span>}
                        </div>
                      )}
                    </>
                  )
                }
              </div>
            )}

            <div
              ref={statsRef}
              className={`${styles.statsRow} ${statsInView ? styles.statsVisible : ''}`}
            >
              <Stat value={skillCount} label="Skills"    inView={statsInView} loading={loading} />
              <Stat value={expCount}   label="Roles" suffix="+" inView={statsInView} loading={loading} />
              <Stat value={projCount}  label="Projects"  inView={statsInView} loading={loading} />
            </div>
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollText}>Scroll</span>
          <span className={styles.scrollLine}><span className={styles.scrollDot} /></span>
        </div>
      </section>

      {/* ── Explore ───────────────────────────────────────────────────────── */}
      <section className={styles.cardsSection}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionEye}>Explore</span>
          <h2 className={styles.sectionTitle}>What I do</h2>
        </div>
        <div
          ref={cardsRef}
          className={`${styles.cardsGrid} ${cardsInView ? styles.cardsVisible : ''}`}
        >
          {NAV_ITEMS.map((item, i) => (
            <TiltCard
              key={item.to}
              {...item}
              index={i}
              onClick={() => navigate(item.to)}
            />
          ))}
        </div>
      </section>

      {/* ── Skills ────────────────────────────────────────────────────────── */}
      {!loading && skills.length > 0 && (
        <section
          ref={tickerRef}
          className={`${styles.tickerSection} ${tickerInView ? styles.tickerVisible : ''}`}
          aria-label="Skills"
        >
          <div className={styles.sectionHead}>
            <span className={styles.sectionEye}>Skills &amp; Technologies</span>
          </div>
          <div className={styles.tickerMask}>
            <div className={styles.tickerRow}>
              <div className={styles.tickerTrack}>
                {[...skills, ...skills, ...skills].map((s, i) => (
                  <span key={i} className={styles.chip}>{s}</span>
                ))}
              </div>
            </div>
            <div className={styles.tickerRow}>
              <div className={`${styles.tickerTrack} ${styles.tickerReverse}`}>
                {[...skills, ...skills, ...skills].map((s, i) => (
                  <span key={i} className={`${styles.chip} ${styles.chipAlt}`}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className={styles.pageFade} aria-hidden="true" />
    </div>
  );
};

export default Home;
