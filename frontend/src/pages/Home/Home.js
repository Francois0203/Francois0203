import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowOutward, MdBolt, MdSchool, MdLocationOn, MdWork,
  MdMusicNote, MdFitnessCenter, MdHiking, MdSportsTennis, MdTranslate, MdInterests,
} from 'react-icons/md';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import useStudioSites from '../../hooks/useStudioSites';
import { resolveGroup } from '../../content/copy/resolve';
import { HOME_FIELDS } from '../../content/copy/home';
import { Modal, SiteShowcase } from '../../components';
import Roadmap from '../../components/Roadmap';
import TechGrid from '../../components/TechGrid';
import StatRow from '../../components/StatRow';
import OrbitRing from '../../components/OrbitRing';
import styles from './Home.module.css';

/**
 * Home, as one dense mosaic.
 *
 * ── What this replaced, and why ────────────────────────────────────────
 * The previous version was six full-viewport "scenes", each carrying a single
 * idea and joined by scroll-driven motion. The structure itself was the
 * problem: `min-height: 100svh` per scene means a screen of air is guaranteed
 * around every element, so the page could only ever read as sparse. Tightening
 * the spacing inside it would not have helped - six viewport-tall sections with
 * tight padding is still six viewport-tall sections.
 *
 * So the model is inverted. Everything that was a scene is now a tile in one
 * grid, sized to its own content, packed against its neighbours on a 12 column
 * grid with a 12px gutter. The first screen now carries the name, the portrait,
 * the live status, the figures, what he is doing right now and the start of the
 * stack, where it previously carried a name and a single sentence.
 *
 * Density is the point, so the rules are:
 *   1. No tile has a viewport-relative minimum height. Tiles are as tall as
 *      their content and no taller.
 *   2. `grid-auto-flow: dense`, so a short tile backfills a gap left by a tall
 *      neighbour instead of leaving a hole.
 *   3. Every tile earns its place with real data. A tile that cannot be
 *      populated is not rendered at all, rather than rendered empty - which is
 *      how the layout stays packed when a field is missing.
 *
 * ── What is deliberately kept ──────────────────────────────────────────
 * The journey stays a full-bleed pinned section that pans horizontally as you
 * scroll, because that is the one part of the page that was asked for by name.
 * It is the single exception to rule 1: pinning requires a scroll distance to
 * pin through. The serif, the warm accent and the cool data counter-colour are
 * kept too.
 *
 * ── The motion rules, unchanged and learned the hard way ───────────────
 *   1. One-shot cascades are class-triggered transitions via hooks/useReveal,
 *      not scroll-driven animations, because `animation-delay` is inert on a
 *      scroll-driven animation - there is no wall-clock time for it to consume,
 *      so a stagger cannot be expressed as a delay.
 *   2. Nothing animates an ancestor of a live iframe. An ancestor with
 *      `opacity < 1` forces a cross-origin frame to rasterise into its parent
 *      layer, so the work tile opts out.
 *   3. Transform and opacity only.
 *   4. Every hidden starting state is scoped to `prefers-reduced-motion:
 *      no-preference`. Elements that are only visible while an animation runs
 *      render as an empty page the moment animations do not run.
 */

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

const toJourney = ({ experience = [], education = [] }) => {
  const ex = experience.map(e => ({
    id:       `exp-${e.id}`,
    title:    e.company || e.employer || e.organisation || 'Role',
    subtitle: e.role || e.position || e.title,
    period:   e.period || e.dates || (e.start ? `${e.start}${e.end ? ` - ${e.end}` : ' - Present'}` : null),
    description: e.description || e.summary,
    tags:     e.tech || e.technologies || e.stack || e.tags,
    kind:     'experience',
    order:    e.order ?? 0,
  }));
  const ed = education.map(e => ({
    id:       `edu-${e.id}`,
    title:    e.institution || e.school || e.university || 'Education',
    subtitle: [e.degree || e.qualification, e.field || e.major].filter(Boolean).join(' - '),
    period:   e.period || e.dates || (e.start ? `${e.start}${e.end ? ` - ${e.end}` : ' - Present'}` : null),
    description: e.description || e.summary,
    tags:     e.tags,
    kind:     'education',
    order:    e.order ?? 0,
  }));
  /*
   * Strictly chronological. The journey is a route: you travel it from the
   * first waypoint to where you are now, so nothing here may depend on a
   * curated display rank.
   *
   * The first version of this sorted on the first four-digit year in the period
   * string, which is not enough precision. "May 2026 - Present" (Shareforce)
   * and "2026 - Present" (the MSc) both resolve to 2026, so the two most
   * recent entries tied and fell back to the `order` field - which is a
   * newest-first display rank, not a date. They could therefore appear in the
   * wrong order, and did.
   *
   * `startKey` resolves to year * 12 + month so ties are broken by real dates,
   * and it prefers an explicit `start` field when a record has one, which is
   * the escape hatch for anything the free-text period cannot express.
   */
  const MONTHS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];

  const startKey = (record) => {
    const text = String(record.start || record.period || '');
    const year = /\b(19|20)\d{2}\b/.exec(text);
    if (!year) return null;

    // Only a month that appears BEFORE the year belongs to the start date:
    // "January 2025 - April 2026" starts in January, not April.
    const head = text.slice(0, year.index).toLowerCase();
    const month = MONTHS.findIndex(m => head.includes(m.slice(0, 3)));

    return Number(year[0]) * 12 + (month >= 0 ? month : 0);
  };

  return [...ex, ...ed]
    .map(s => ({ ...s, key: startKey(s) }))
    .sort((a, b) => {
      if (a.key !== null && b.key !== null) return a.key - b.key;

      /*
       * Undated entries are the school-era ones - "During Matric Year",
       * "Completed" - and they all precede the first dated record. Within them,
       * experience before education: the jobs run through the matric year and
       * the certificate is awarded at the end of it. `order` reversed is the
       * last resort, so the result is always deterministic.
       */
      if (a.key === null && b.key === null) {
        if (a.kind !== b.kind) return a.kind === 'experience' ? -1 : 1;
        return b.order - a.order;
      }
      return a.key === null ? -1 : 1;
    });
};

/**
 * The figures for scene 2, derived from real data only.
 *
 * A portfolio that calls itself a data scientist's cannot put invented numbers
 * on its front page, so each of these is counted from Firestore or the synced
 * project list. Anything that cannot be derived is omitted rather than
 * estimated, which is why this returns a filtered list rather than a fixed set.
 */
const buildStats = ({ experience, education, skills, sites, projects }) => {
  // The earliest four-digit year on record is where the story starts. The
  // school-era entries carry no year by design, so they are simply absent here.
  const years = (() => {
    const found = [...experience, ...education]
      .map(e => /\b(19|20)\d{2}\b/.exec(String(e.period ?? '')))
      .filter(Boolean)
      .map(m => Number(m[0]));

    if (found.length === 0) return null;
    return new Date().getFullYear() - Math.min(...found);
  })();

  const shipped = (sites?.length ?? 0) + (projects?.length ?? 0);

  return [
    years !== null && { label: 'Years in', value: years, suffix: 'yrs' },
    skills.length > 0 && { label: 'Technologies', value: skills.length },
    education.length > 0 && { label: 'Qualifications', value: education.length },
    shipped > 0 && { label: 'Things shipped', value: shipped },
  ].filter(Boolean);
};

/**
 * An icon for each interest, matched on the interest's own name.
 *
 * Keyed on a normalised name and not on array position, so reordering the list
 * in Firestore cannot silently give squash a guitar. Anything unmatched falls
 * back to a generic mark rather than to no mark, which would leave one chip in
 * a row of five sitting at a different height.
 */
const INTEREST_ICONS = {
  guitar: MdMusicNote,
  music: MdMusicNote,
  gym: MdFitnessCenter,
  weights: MdFitnessCenter,
  hiking: MdHiking,
  squash: MdSportsTennis,
  tennis: MdSportsTennis,
};

const interestIcon = (name) =>
  INTEREST_ICONS[String(name).trim().toLowerCase()] ?? MdInterests;

/* ─── Tiles ────────────────────────────────────────────────────────────────── */

/**
 * One cell of the mosaic.
 *
 * `span` and `rows` are written into the grid as custom properties rather than
 * as a class per size, because the sizes are a layout decision made at the call
 * site and there are a dozen of them. The media queries in the stylesheet
 * override `--span` wholesale at narrow widths, so no tile needs to know how it
 * collapses.
 */
const Tile = ({
  span = 4, rows = 1, tone, id, label, className = '', children,
}) => (
  <section
    id={id}
    className={`${styles.tile} ${className}`}
    data-tone={tone}
    style={{ '--span': span, '--rows': rows }}
  >
    {label && <h2 className={styles.tileLabel}>{label}</h2>}
    {children}
  </section>
);

/* ─── Page ─────────────────────────────────────────────────────────────────── */

const Home = () => {
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const { featured: featuredSites, loading: sitesLoading } = useStudioSites({ featuredLimit: 3 });
  const t = resolveGroup(HOME_FIELDS, overrides.home);
  const navigate = useNavigate();

  const [openMilestone, setOpenMilestone] = useState(null);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const github = social.find(s => (s.key || '').toLowerCase() === 'github');
  const linkedin = social.find(s => (s.key || '').toLowerCase() === 'linkedin');

  const githubUser = github?.url ? github.url.replace(/\/$/, '').split('/').pop() : null;
  const photoUrl = personal.photoUrl || (githubUser ? `https://github.com/${githubUser}.png` : null);

  const journey = useMemo(() => toJourney(data ?? {}), [data]);
  const skills = useMemo(() => flattenSkills(data?.skills), [data]);

  /* The two live commitments, which is what "now" means on this page. Both are
     found by the same "present" test the journey ordering uses, so this tile
     cannot disagree with the waypoints further down. */
  const now = useMemo(() => {
    const present = /present/i;
    return {
      role: (data?.experience ?? []).find(e => present.test(String(e.period ?? ''))),
      study: (data?.education ?? []).find(e => present.test(String(e.period ?? ''))),
    };
  }, [data]);

  /* firebase/firestore.js unwraps the interests document to its `items` array
     before it reaches here, so `data.interests` is already the list. The object
     form is still accepted because that is the shape stored in Firestore, and
     reading it wrongly is a silently empty tile rather than an error. */
  const interests = useMemo(() => {
    const raw = data?.interests;
    const list = Array.isArray(raw) ? raw : raw?.items ?? [];
    return list.map(itemLabel).filter(Boolean);
  }, [data]);

  const languages = useMemo(
    () => (personal.languages ?? []).map(itemLabel).filter(Boolean),
    [personal],
  );

  const badges = useMemo(() => [
    contact.availability?.status === 'open' && { Icon: MdBolt, text: t.availabilityLabel, tone: 'cool' },
    contact.location && {
      Icon: MdLocationOn,
      /* The last two parts of the address. "Irene, Centurion, South Africa" is
         a home address; "Centurion, South Africa" is a location. */
      text: String(contact.location).split(',').slice(-2).map(s => s.trim()).join(', '),
      tone: 'warm',
    },
  ].filter(Boolean), [contact, t.availabilityLabel]);

  const stats = useMemo(() => buildStats({
    experience: data?.experience ?? [],
    education: data?.education ?? [],
    skills,
    sites: featuredSites ?? [],
    projects: data?.projects ?? [],
  }), [data, skills, featuredSites]);

  /* Two observers, one per region. Every tile in the mosaic is within a screen
     or two of the top, so a per-tile observer would buy nothing but bookkeeping. */
  const [gridRef, gridShown] = useReveal({ threshold: 0.02 });
  const [lowerRef, lowerShown] = useReveal({ threshold: 0.04 });

  return (
    <div className={styles.page}>
      {/* One ambient wash, fixed, statically painted. */}
      <div className={styles.ambient} aria-hidden="true" />

      <div
        ref={gridRef}
        className={styles.mosaic}
        data-reveal-shown={gridShown ? '' : undefined}
        style={{ '--reveal-step': '45ms' }}
      >
        {/* ── Identity ─────────────────────────────────────────────────── */}
        <Tile span={7} rows={2} className={styles.tIdentity}>
          <div data-reveal style={{ '--i': 0 }}>
            <p className={styles.eyebrow}>{t.heroLede}</p>

            {/* Word by word, so the name lands as a sequence rather than a
                block. A real CSS delay is fine here: this is a mount
                animation, not a scrubbed one. */}
            <h1 className={styles.name}>
              {(personal.name ?? '').split(' ').filter(Boolean).map((word, i) => (
                <span key={`${word}-${i}`} className={styles.nameWord} style={{ '--i': i }}>
                  {word}
                </span>
              ))}
            </h1>

            <p className={styles.statement}>{t.heroStatement}</p>
          </div>

          {badges.length > 0 && (
            <ul className={styles.badges} data-reveal style={{ '--i': 1 }}>
              {badges.map(({ Icon, text, tone }, i) => (
                <li key={text} className={styles.badge} data-tone={tone} style={{ '--i': i }}>
                  <Icon aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.actions} data-reveal style={{ '--i': 2 }}>
            <button type="button" className={styles.ctaPrimary} onClick={() => navigate('/projects')}>
              {t.heroCtaPrimary}
              <MdArrowOutward aria-hidden="true" />
            </button>
            <button type="button" className={styles.ctaGhost} onClick={() => navigate('/connect')}>
              {t.heroCtaSecondary}
            </button>

            {github && (
              <a
                href={github.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
                aria-label="GitHub"
              >
                <FaGithub aria-hidden="true" />
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
                aria-label="LinkedIn"
              >
                <FaLinkedin aria-hidden="true" />
              </a>
            )}
          </div>
        </Tile>

        {/* ── Portrait ─────────────────────────────────────────────────── */}
        <Tile span={5} rows={2} className={styles.tPortrait}>
          <div className={styles.portraitFrame} data-reveal style={{ '--i': 1 }}>
            <OrbitRing photoUrl={photoUrl} name={personal.name} />
          </div>
        </Tile>

        {/* ── Figures ──────────────────────────────────────────────────── */}
        {stats.length > 0 && (
          <Tile span={7} className={styles.tStats}>
            <div data-reveal style={{ '--i': 3 }}>
              <StatRow stats={stats} />
            </div>
          </Tile>
        )}

        {/* ── Right now ────────────────────────────────────────────────── */}
        {(now.role || now.study) && (
          <Tile span={5} label={t.nowTitle} tone="cool" className={styles.tNow}>
            <ul className={styles.nowList} data-reveal style={{ '--i': 4 }}>
              {now.role && (
                <li className={styles.nowItem}>
                  <MdWork className={styles.nowIcon} aria-hidden="true" />
                  <span>
                    <strong>{now.role.role || now.role.position || now.role.title}</strong>
                    {(now.role.company || now.role.employer) && (
                      <span className={styles.nowAt}>{now.role.company || now.role.employer}</span>
                    )}
                  </span>
                </li>
              )}
              {now.study && (
                <li className={styles.nowItem}>
                  <MdSchool className={styles.nowIcon} aria-hidden="true" />
                  <span>
                    <strong>{now.study.degree || now.study.qualification}</strong>
                    {(now.study.institution || now.study.university) && (
                      <span className={styles.nowAt}>
                        {now.study.institution || now.study.university}
                      </span>
                    )}
                  </span>
                </li>
              )}
            </ul>
          </Tile>
        )}

        {/* ── The statement ─────────────────────────────────────────────
               One row, seven columns. This tile used to span two rows beside
               the stack, and grid stretched it to the stack's full height:
               measured at 1007px tall for four lines of text, which was most
               of the empty space on the page. */}
        <Tile span={7} id="about" label={t.statementTitle} className={styles.tAbout}>
          <p className={styles.body} data-reveal style={{ '--i': 5 }}>{t.statementBody}</p>
        </Tile>

        {/* ── Outside work ─────────────────────────────────────────────────
               Fills the rest of that row with real data rather than with air.
               Rendered only when there is something to put in it. */}
        {(interests.length > 0 || languages.length > 0) && (
          <Tile span={5} label={t.offTitle} className={styles.tOff}>
            {interests.length > 0 && (
              <ul className={styles.chips} data-reveal style={{ '--i': 6 }}>
                {interests.map((name, i) => {
                  const Icon = interestIcon(name);
                  return (
                    <li key={name} className={styles.chip} style={{ '--i': i }}>
                      <Icon aria-hidden="true" />
                      {name}
                    </li>
                  );
                })}
              </ul>
            )}

            {languages.length > 0 && (
              <p className={styles.langs} data-reveal style={{ '--i': 7 }}>
                <MdTranslate aria-hidden="true" />
                {languages.join(', ')}
              </p>
            )}
          </Tile>
        )}

        {/* ── The stack ───────────────────────────────────────────────────
               Full width, which is a density decision rather than an emphasis
               one: the same 28 marks in three families measured 1007px tall in
               a seven column tile and roughly half that across twelve, because
               each family's row holds nearly twice as many. */}
        {(loading || skills.length > 0) && (
          <Tile span={12} id="capabilities" label={t.toolkitTitle} className={styles.tStack}>
            {loading
              ? (
                <div className={styles.techSkel} aria-hidden="true">
                  {Array.from({ length: 18 }, (_, i) => (
                    <span key={i} className={styles.techSkelTile} />
                  ))}
                </div>
              )
              : <TechGrid skills={skills} />
            }
          </Tile>
        )}
      </div>

      {/* ── The work ─────────────────────────────────────────────────────
             Outside the mosaic, because these are live cross-origin iframes:
             animating an ancestor of one forces its compositor surface to be
             re-composited every frame, so the cards themselves never move. */}
      <section
        ref={lowerRef}
        className={styles.band}
        data-reveal-shown={lowerShown ? '' : undefined}
        style={{ '--reveal-step': '60ms' }}
      >
        <header className={styles.bandHead}>
          <div>
            <h2 className={styles.bandTitle} data-reveal style={{ '--i': 0 }}>{t.workTitle}</h2>
            <p className={styles.bandLede} data-reveal style={{ '--i': 1 }}>{t.workLede}</p>
          </div>
          <button
            type="button"
            className={styles.ctaGhost}
            onClick={() => navigate('/projects')}
            data-reveal
            style={{ '--i': 2 }}
          >
            {t.workCta}
            <MdArrowOutward aria-hidden="true" />
          </button>
        </header>

        {sitesLoading
          ? (
            <div className={styles.workGrid} aria-hidden="true">
              {[0, 1, 2].map(i => <span key={i} className={styles.workSkelCard} />)}
            </div>
          )
          : featuredSites.length === 0
            ? <p className={styles.empty}>{t.workEmpty}</p>
            : (
              <div className={styles.workGrid}>
                {featuredSites.map(site => (
                  <SiteShowcase key={site.id} project={site} />
                ))}
              </div>
            )
        }
      </section>

      {/* ── The journey ──────────────────────────────────────────────────
             The one part of the page that keeps a scroll length of its own: it
             pins and pans by 100cqw, so it has to be full bleed and it has to
             have a distance to pin through. */}
      <section className={styles.journeyBand}>
        <header className={styles.bandHead}>
          <div>
            <h2 className={styles.bandTitle}>{t.journeyTitle}</h2>
            <p className={styles.bandLede}>{t.journeyLede}</p>
          </div>
        </header>

        {loading
          ? (
            <div className={styles.roadmapSkel} aria-hidden="true">
              {[0, 1, 2].map(i => <div key={i} className={styles.roadmapSkelCard} />)}
            </div>
          )
          : (
            <Roadmap
              stops={journey}
              onSelect={setOpenMilestone}
              heading={t.journeyTitle}
              emptyText={t.journeyEmpty}
            />
          )
        }
      </section>

      <Modal
        open={!!openMilestone}
        onClose={() => setOpenMilestone(null)}
        title={openMilestone?.title}
        size="md"
      >
        {openMilestone && (
          <div className={styles.milestoneModal}>
            <span className={styles.milestoneKind}>
              {openMilestone.kind === 'education' ? 'Education' : 'Experience'}
            </span>
            {openMilestone.subtitle && <p className={styles.milestoneSub}>{openMilestone.subtitle}</p>}
            {openMilestone.period && <p className={styles.milestonePeriod}>{openMilestone.period}</p>}
            {openMilestone.description && <p className={styles.milestoneDesc}>{openMilestone.description}</p>}
            {openMilestone.tags?.length > 0 && (
              <div className={styles.milestoneTags}>
                {openMilestone.tags.map((tag, i) => (
                  <span key={i} className={styles.milestoneTag}>{tag}</span>
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
