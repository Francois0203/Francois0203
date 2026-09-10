import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaStar, FaLock } from 'react-icons/fa';
import { MdArrowOutward } from 'react-icons/md';
import { Modal, LightWaveButton, SiteShowcase } from '../../components';
import LangBar from '../../components/LangBar';
import StatRow from '../../components/StatRow';
import { useGitHubProjects, useStudioSites } from '../../hooks';
import useSiteCopy from '../../hooks/useSiteCopy';
import { resolveGroup } from '../../content/copy/resolve';
import { PROJECTS_FIELDS } from '../../content/copy/projects';
import { parseReadme } from './parseReadme';
import ReadmeRenderer from './ReadmeRenderer';
import styles from './Projects.module.css';
import useReveal from '../../hooks/useReveal';
import { langColor } from './langColors';

// ─── Figures ─────────────────────────────────────────────────────────────────

/**
 * The counts under the heading, all read off the live data.
 *
 * Each figure is omitted when it cannot be derived rather than shown as a zero:
 * "0 stars" is a claim, whereas an absent figure is simply an absent figure.
 */
const buildStats = ({ sites, projects }) => {
  const stars = projects.reduce((a, p) => a + (p.stars ?? 0), 0);
  const languages = new Set(projects.map(p => p.language).filter(Boolean)).size;

  return [
    sites.length > 0 && { label: 'Live sites', value: sites.length },
    projects.length > 0 && { label: 'Repositories', value: projects.length },
    languages > 0 && { label: 'Languages', value: languages },
    stars > 0 && { label: 'Stars', value: stars },
  ].filter(Boolean);
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonStrip} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonMeta}>
        <div className={`${styles.skeleton} ${styles.skeletonLang}`} />
        <div className={`${styles.skeleton} ${styles.skeletonStars}`} />
      </div>
      <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLine1}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLine2}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLine3}`} />
      <div className={styles.skeletonTags}>
        {[72, 58, 80].map(w => (
          <div key={w} className={`${styles.skeleton} ${styles.skeletonTag}`} style={{ width: w }} />
        ))}
      </div>
    </div>
    <div className={styles.skeletonFooter}>
      <div className={`${styles.skeleton} ${styles.skeletonBtn}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLink}`} />
    </div>
  </div>
);

// ─── Showcase skeleton ────────────────────────────────────────────────────────

const SkeletonShowcase = () => (
  <div className={styles.skeletonShowcase} aria-hidden="true">
    <div className={styles.skeletonViewport} />
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeleton} ${styles.skeletonLang}`} />
      <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLine2}`} />
    </div>
  </div>
);

// ─── Project card ─────────────────────────────────────────────────────────────

const ProjectCard = ({ project, onReadme }) => {
  const { name, description: githubDesc, url, language, stars, topics, isPrivate, readme } = project;

  const hasReadme = readme?.trim().length > 0;

  // Parse README once - cheap, synchronous
  const parsed = hasReadme
    ? parseReadme(readme, { fallback: githubDesc ?? '' })
    : { description: githubDesc ?? '', features: [], techStack: [] };

  const { description, features, techStack } = parsed;

  // Collapse description to 2 lines when features are also shown
  const descClass = features.length > 0
    ? `${styles.cardDesc} ${styles.clamp2}`
    : styles.cardDesc;

  return (
    <div className={styles.card}>
      {/* Accent strip */}
      <div className={styles.screenshotPlaceholder} aria-hidden="true" />

      <div className={styles.cardBody}>
        {/* Meta row */}
        <div className={styles.cardMeta}>
          <span className={styles.languageBadge}>
            {language && (
              <>
                <span className={styles.languageDot} style={{ background: langColor(language) }} aria-hidden="true" />
                {language}
              </>
            )}
          </span>
          <div className={styles.metaRight}>
            <span className={styles.stars}>
              <FaStar className={styles.starsIcon} aria-hidden="true" />
              {stars ?? 0}
            </span>
            {isPrivate && (
              <span className={styles.privatePill}>
                <FaLock size={9} aria-hidden="true" /> Private
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className={styles.cardName}>{name}</h3>

        {/* Description */}
        {description && <p className={descClass}>{description}</p>}

        {/* Features */}
        {features.length > 0 && (
          <>
            <p className={styles.featuresLabel}>Features</p>
            <ul className={styles.featureList}>
              {features.map((f, i) => (
                <li key={i} className={styles.featureItem}>
                  <span className={styles.featureDot} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Tech stack from README */}
        {techStack.length > 0 && (
          <>
            <p className={styles.techLabel}>Built with</p>
            <div className={styles.techList}>
              {techStack.map(t => (
                <span key={t} className={styles.techChip}>{t}</span>
              ))}
            </div>
          </>
        )}

        {/* GitHub topics (only if different from tech stack) */}
        {topics?.length > 0 && (
          <div className={styles.topics}>
            {topics.slice(0, 5).map(t => (
              <span key={t} className={styles.topic}>#{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Footer */}
      <div className={styles.cardFooter}>
        {hasReadme && (
          <LightWaveButton className={styles.readmeBtn} onClick={() => onReadme(project)}>
            Read README
          </LightWaveButton>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
          <FaGithub aria-hidden="true" />
          GitHub
          <MdArrowOutward aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Projects = () => {
  const { projects, loading, error } = useGitHubProjects();
  const { sites, loading: sitesLoading, error: sitesError } = useStudioSites();
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(PROJECTS_FIELDS, overrides.projects);

  /* The language chosen in the chart's legend, or null for everything. The
     chart is the control, so there is no separate filter bar to keep in sync. */
  const [lang, setLang] = useState(null);

  const repos = projects ?? [];

  const shown = useMemo(
    () => (lang ? repos.filter(p => p.language === lang) : repos),
    [repos, lang],
  );

  const stats = useMemo(
    () => buildStats({ sites, projects: repos }),
    [sites, repos],
  );

  const [heroRef, heroShown] = useReveal();
  const [studioRef, studioInView] = useReveal({ threshold: 0.12 });
  const [codeRef, codeInView] = useReveal({ threshold: 0.08 });

  return (
    <section className={styles.page}>
      <div className={styles.container}>

        {/* ── Scene 1 ── the title card ───────────────────────────────── */}
        <header
          ref={heroRef}
          className={styles.hero}
          data-reveal-shown={heroShown ? '' : undefined}
          style={{ '--reveal-step': '90ms' }}
        >
          <p className={styles.heroEyebrow} data-reveal style={{ '--i': 0 }}>{t.eyebrow}</p>
          <h1 className={styles.heading} data-reveal style={{ '--i': 1 }}>{t.heading}</h1>
          <p className={styles.heroLede} data-reveal style={{ '--i': 2 }}>{t.lede}</p>

          {/* The figures replace the old "2 live sites · 14 repositories" line,
              which said the same thing without ever being read as a number. */}
          {stats.length > 0 && (
            <div className={styles.heroStats} data-reveal style={{ '--i': 3 }}>
              <StatRow stats={stats} />
            </div>
          )}
        </header>

        {/* ── Scene 2 ── the live sites ───────────────────────────────── */}
        <section
          ref={studioRef}
          className={styles.section}
          data-reveal-shown={studioInView ? '' : undefined}
          style={{ '--reveal-step': '80ms' }}
        >
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} data-reveal style={{ '--i': 0 }}>{t.studioTitle}</h2>
            <p className={styles.sectionLede} data-reveal style={{ '--i': 1 }}>{t.studioLede}</p>
          </div>

          {sitesError ? (
            <div className={styles.errorCard}>
              <p>Could not load the client sites. Please try again later.</p>
            </div>
          ) : (
            <div className={styles.showcaseGrid}>
              {sitesLoading
                ? Array.from({ length: 2 }).map((_, i) => <SkeletonShowcase key={i} />)
                : sites.length === 0
                  ? <div className={styles.emptyCard}><p>{t.studioEmpty}</p></div>
                  /* Each showcase reveals on its own index. This grid had no
                     entrance at all, so two live sites simply appeared. */
                  : sites.map((p, i) => (
                    <div key={p.id} data-reveal style={{ '--i': i + 2 }}>
                      <SiteShowcase project={p} />
                    </div>
                  ))
              }
            </div>
          )}
        </section>

        {/* ── Scene 3 ── the repositories, with the language mix ─────── */}
        <section
          ref={codeRef}
          className={styles.section}
          data-reveal-shown={codeInView ? '' : undefined}
          style={{ '--reveal-step': '55ms' }}
        >
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} data-reveal style={{ '--i': 0 }}>{t.codeTitle}</h2>
            <p className={styles.sectionLede} data-reveal style={{ '--i': 1 }}>{t.codeLede}</p>
          </div>

          {!loading && repos.length > 0 && (
            <LangBar projects={repos} onSelect={setLang} active={lang} />
          )}

          {/* Announced, because clicking a legend chip changes a grid that may
              be below the fold - a filter with no feedback reads as a page that
              lost its content. */}
          <p className={styles.filterStatus} role="status">
            {lang
              ? `Showing ${shown.length} ${shown.length === 1 ? 'repository' : 'repositories'} in ${lang}.`
              : ''}
          </p>

          {error ? (
            <div className={styles.errorCard}>
              <p>Could not load projects. Please try again later.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : shown.length === 0
                  ? <div className={styles.emptyCard}><p>{t.codeEmpty}</p></div>
                  /* The densest region on the site, and previously the only one
                     with no entrance whatsoever. The index is capped so a
                     fourteenth card does not wait most of a second. */
                  : shown.map((p, i) => (
                    <div key={p.id} data-reveal style={{ '--i': Math.min(i, 8) + 2 }}>
                      <ProjectCard project={p} onReadme={setSelected} />
                    </div>
                  ))
              }
            </div>
          )}
        </section>

      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        size="lg"
      >
        {selected?.readme && <ReadmeRenderer markdown={selected.readme} />}
      </Modal>
    </section>
  );
};

export default Projects;
