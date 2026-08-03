import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowOutward, MdCode, MdEmail,
  MdAutoStories, MdMenuBook, MdWork, MdSchool,
} from 'react-icons/md';
import { FaGithub, FaLinkedin, FaLeaf, FaFeatherAlt } from 'react-icons/fa';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import { resolveGroup } from '../../content/copy/resolve';
import { HOME_FIELDS } from '../../content/copy/home';
import { Modal, MagneticButton, CursorGlowButton } from '../../components';
import styles from './Home.module.css';

// Evaluated once at module load - avoids React overhead and is stable
// across the page lifetime. Coarse-pointer (touch) also implies mobile.
const IS_MOBILE = typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 767px)').matches ||
   window.matchMedia('(pointer: coarse)').matches);

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

// Fewer particles on mobile: less DOM, less GPU work
const MOTE_COUNT = IS_MOBILE ? 0 : 8;

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

  if (motes.length === 0) return null;

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

const LEAF_COUNT = IS_MOBILE ? 0 : 7;

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

  if (leaves.length === 0) return null;

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

/* ─── Journey milestones ───────────────────────────────────────────────────── */

// Vertical timeline. The connecting spine is drawn in CSS from the dot column,
// so it always lines up with the dots no matter how many milestones there are.
const Journey = ({ stops, onSelect }) => {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className={`${styles.journey} ${inView ? styles.journeyVisible : ''}`}>
      {stops.length === 0 ? (
        <p className={styles.journeyEmpty}>The journey is being written…</p>
      ) : (
        <ol className={styles.journeyList}>
          {stops.map((s, i) => {
            const isEdu = s.kind === 'education';
            const Icon  = isEdu ? MdSchool : MdWork;
            return (
              <li key={s.id ?? i} className={styles.journeyItem} style={{ '--ji': i }}>
                <span className={styles.journeyDot} aria-hidden="true">
                  <Icon className={styles.journeyDotIcon} />
                  {/* Pulse only on the newest stop - on every dot it was just noise. */}
                  {i === 0 && <span className={styles.journeyDotPulse} />}
                </span>

                {/* The whole card is the control: the lede invites you to press a
                    milestone, and a 28px dot was far too small a target. */}
                <button
                  type="button"
                  className={styles.journeyCard}
                  onClick={() => onSelect(s)}
                >
                  <span className={styles.journeyMeta}>
                    <span className={styles.journeyPeriod}>{s.period ?? '—'}</span>
                    <span className={styles.journeyKind}>
                      {isEdu ? 'Education' : 'Experience'}
                    </span>
                  </span>
                  <span className={styles.journeyTitle}>{s.title}</span>
                  {s.subtitle && (
                    <span className={styles.journeySubtitle}>{s.subtitle}</span>
                  )}
                  <span className={styles.journeyMore}>
                    Read this page <MdArrowOutward aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

/* ─── Pile of skill leaves ─────────────────────────────────────────────────── */

// Groups the flattened skills back into their categories, preserving the order
// they arrive in. `flattenSkills` already resolves each skill's `group` - the
// previous pile discarded it and rendered all 28 as one undifferentiated blob.
const groupSkills = (skills) => {
  const out = [];
  const byName = new Map();
  for (const s of skills) {
    const name = s.group ?? null;
    let g = byName.get(name);
    if (!g) { g = { name, items: [] }; byName.set(name, g); out.push(g); }
    g.items.push(s);
  }
  return out;
};

const SkillPile = ({ skills }) => {
  const [ref, inView] = useInView(0.10);
  if (skills.length === 0) return null;
  const groups = groupSkills(skills);

  // Continuous index across groups so the reveal staggers down the whole
  // section rather than restarting at every heading.
  let n = -1;

  return (
    <div ref={ref} className={`${styles.pile} ${inView ? styles.pileVisible : ''}`}>
      {groups.map((g, gi) => (
        <div key={g.name ?? gi} className={styles.pileGroup}>
          {g.name && (
            <p className={styles.pileGroupHead}>
              <FaLeaf className={styles.pileGroupLeaf} aria-hidden="true" />
              <span className={styles.pileGroupName}>{g.name}</span>
              <span className={styles.pileGroupRule} aria-hidden="true" />
              <span className={styles.pileGroupCount}>{g.items.length}</span>
            </p>
          )}
          <ul className={styles.pileChips}>
            {g.items.map((s, i) => {
              n += 1;
              return (
                <li key={i} className={styles.skillChip} style={{ '--si': n }}>
                  {s.label}
                </li>
              );
            })}
          </ul>
        </div>
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
    subtitle: [e.degree || e.qualification, e.field || e.major].filter(Boolean).join(' - '),
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
  const { overrides } = useSiteCopy();
  const t = resolveGroup(HOME_FIELDS, overrides.home);
  const navigate = useNavigate();
  const pageRef  = useRef(null);

  const [openMilestone, setOpenMilestone] = useState(null);

  /* Cursor warm-spot - skip entirely on touch / coarse pointers */
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

  // The drop-cap is the first letter of the (editable) opening paragraph itself,
  // not a separate hardcoded glyph - so editing the copy changes the drop-cap too.
  const coverText    = `${t.coverProseInvite} ${opening}`.trimStart();
  const coverDropcap = coverText.charAt(0);
  const coverRest    = coverText.slice(1);

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
      {/* No sceneFrame_cover modifier: unlike the journey/toolkit frames the
          cover has never had one, and referencing it emitted a literal
          "undefined" class into the markup. */}
      <div className={styles.sceneFrame}>
      <section ref={coverRef} className={styles.cover}>

        <div className={styles.coverFlourish} aria-hidden="true">
          <FaFeatherAlt />
          <span className={styles.coverFlourishLine} />
        </div>

        <p className={styles.coverEyebrow}>{t.coverEyebrow}</p>

        <h1 className={styles.coverTitleLine}>
          <span className={styles.coverTitleSerif}>{t.coverTitleSerif}</span>
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
              <span className={styles.coverByLabel}>{t.coverByLabel}</span>
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
              {coverDropcap && <span className={styles.coverDropcap}>{coverDropcap}</span>}
              <WordReveal
                text={coverRest}
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
              {t.coverInviteText}
            </p>
            <div className={styles.coverCtas}>
              <MagneticButton onClick={() => navigate('/bio')}>
                {t.coverCtaPrimary} <MdAutoStories aria-hidden="true" />
              </MagneticButton>
              <CursorGlowButton onClick={() => navigate('/projects')}>
                {t.coverCtaSecondary}
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

      </section>
      </div>

      {/* ── Scene 3 ── The Journey ────────────────────────────────────── */}
      <div className={`${styles.sceneFrame} ${styles.sceneFrame_journey}`}>
      <section ref={journeyRef} className={`${styles.scene} ${journeyInView ? styles.sceneVisible : ''}`}>
        <div className={styles.sceneHead}>
          <span className={styles.sceneEye}>{t.journeyEye}</span>
          <h2 className={styles.sceneTitle}>{t.journeyTitle}</h2>
          <p className={styles.sceneLede}>
            {t.journeyLede}
          </p>
        </div>

        {loading
          ? <div className={styles.journeySkel}>{[0, 1, 2].map(i => (
              <div key={i} className={styles.journeySkelRow}>
                <span className={styles.journeySkelDot} />
                <span className={styles.journeySkelCard} />
              </div>
            ))}</div>
          : <Journey stops={journey} onSelect={setOpenMilestone} />
        }
      </section>
      </div>

      {/* ── Scene 4 ── The Toolkit ────────────────────────────────────── */}
      <div className={`${styles.sceneFrame} ${styles.sceneFrame_toolkit}`}>
      {(loading || skills.length > 0) && (
        <section ref={pileSecRef} className={`${styles.scene} ${pileSecInView ? styles.sceneVisible : ''}`}>
          <div className={styles.sceneHead}>
            <span className={styles.sceneEye}>{t.toolkitEye}</span>
            <h2 className={styles.sceneTitle}>{t.toolkitTitle}</h2>
            <p className={styles.sceneLede}>
              {t.toolkitLede}
            </p>
          </div>

          {loading
            ? (
              <div className={styles.pile}>
                {[[72, 56, 88, 64, 80], [92, 50, 68, 76, 60, 84], [70, 88, 54]].map((widths, gi) => (
                  <div key={gi} className={styles.pileGroup}>
                    <span className={styles.pileSkelHead} />
                    <ul className={styles.pileChips}>
                      {widths.map((w, i) => (
                        <li key={i} className={styles.skillLeafSkel} style={{ width: w }} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
            : <SkillPile skills={skills} />
          }
        </section>
      )}
      </div>

      {/* ── Scene 5 ── Epilogue ───────────────────────────────────────── */}
      <section ref={endRef} className={`${styles.scene} ${styles.sceneEnd} ${endInView ? styles.sceneVisible : ''}`}>
        <div className={styles.endCard}>
          <span className={styles.endOrnament} aria-hidden="true">
            <MapleLeaf />
            <span className={styles.endOrnamentLine} />
            <MapleLeaf />
          </span>
          <h2 className={styles.endTitle}>{t.endTitlePre}<em>{t.endTitleEm}</em></h2>
          <p className={styles.endText}>
            {t.endText}
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
    </div>
  );
};

export default Home;
