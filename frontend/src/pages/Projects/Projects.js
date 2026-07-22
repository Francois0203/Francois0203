import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaStar, FaLock } from 'react-icons/fa';
import { MdArrowOutward } from 'react-icons/md';
import { Modal, LightWaveButton } from '../../components';
import { useGitHubProjects } from '../../hooks';
import useSiteCopy from '../../hooks/useSiteCopy';
import { resolveGroup } from '../../content/copy/resolve';
import { PROJECTS_FIELDS } from '../../content/copy/projects';
import { parseReadme } from './parseReadme';
import ReadmeRenderer from './ReadmeRenderer';
import styles from './Projects.module.css';

// ─── Language colour map ──────────────────────────────────────────────────────

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python:  '#3572a5',
  Go:         '#00add8', Rust:       '#dea584', Java:    '#b07219',
  'C#':       '#178600', 'C++':      '#f34b7d', C:       '#555555',
  HTML:       '#e34c26', CSS:        '#563d7c', SCSS:    '#c6538c',
  Swift:      '#fa7343', Kotlin:     '#a97bff', Ruby:    '#701516',
  PHP:        '#4f5d95', Shell:      '#89e051', Dart:    '#00b4ab',
  R:          '#198ce7', Vue:        '#41b883', Svelte:  '#ff3e00',
};

const langColor = (lang) => LANG_COLORS[lang] ?? 'var(--accent-1)';

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

// ─── Project card ─────────────────────────────────────────────────────────────

const ProjectCard = ({ project, onReadme }) => {
  const { name, description: githubDesc, url, language, stars, topics, isPrivate, readme, owner, repo } = project;

  const hasReadme = readme?.trim().length > 0;

  // Parse README once — cheap, synchronous
  const parsed = hasReadme
    ? parseReadme(readme, { owner, repo, fallback: githubDesc ?? '' })
    : { description: githubDesc ?? '', features: [], techStack: [], screenshot: null };

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
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(PROJECTS_FIELDS, overrides.projects);

  return (
    <section className={styles.page}>
      <div className={styles.container}>

        <header className={styles.header}>
          <p className={styles.chapterEyebrow}>
            <span className={styles.chapterMark}>{t.chapterMark}</span>
            <span className={styles.chapterDash} aria-hidden="true">—</span>
            <span className={styles.chapterName}>{t.chapterName}</span>
          </p>
          <h1 className={styles.heading}>{t.heading}</h1>
          <p>
            {loading
              ? 'Fetching projects from the bench…'
              : projects
                ? `${projects.length} ${projects.length === 1 ? 'repository' : 'repositories'} laid out for you`
                : ''}
          </p>
        </header>

        {error ? (
          <div className={styles.errorCard}>
            <p>Could not load projects. Please try again later.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : projects?.length === 0
                ? <div className={styles.emptyCard}><p>No projects configured yet.</p></div>
                : projects?.map(p => (
                  <ProjectCard key={p.id} project={p} onReadme={setSelected} />
                ))
            }
          </div>
        )}

        {/* ── Next chapter ─────────────────────────────────────────── */}
        <footer className={styles.nextChapter}>
          <span className={styles.nextChapterLabel}>{t.nextChapterLabel}</span>
          <button
            type="button"
            className={styles.nextChapterBtn}
            onClick={() => navigate('/connect')}
          >
            <span className={styles.nextChapterTitle}>
              {t.nextChapterTitle}
            </span>
            <span className={styles.nextChapterHint}>
              {t.nextChapterHint}<MdArrowOutward aria-hidden="true" />
            </span>
          </button>
        </footer>
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
