import { useState } from 'react';
import { FaGithub, FaStar, FaLock } from 'react-icons/fa';
import { MdArrowOutward } from 'react-icons/md';
import { Modal, LightWaveButton } from '../../components';
import { useGitHubProjects } from '../../hooks';
import ReadmeRenderer from './ReadmeRenderer';
import styles from './Projects.module.css';

// ─── Language colour map ─────────────────────────────────────────────────────

const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python:     '#3572a5',
  Go:         '#00add8',
  Rust:       '#dea584',
  Java:       '#b07219',
  'C#':       '#178600',
  'C++':      '#f34b7d',
  C:          '#555555',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  SCSS:       '#c6538c',
  Swift:      '#fa7343',
  Kotlin:     '#a97bff',
  Ruby:       '#701516',
  PHP:        '#4f5d95',
  Shell:      '#89e051',
  Dart:       '#00b4ab',
  R:          '#198ce7',
  Vue:        '#41b883',
  Svelte:     '#ff3e00',
};

function langColor(language) {
  return LANG_COLORS[language] ?? 'var(--accent-1)';
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonMeta}>
      <div className={`${styles.skeleton} ${styles.skeletonLang}`} />
      <div className={`${styles.skeleton} ${styles.skeletonStars}`} />
    </div>
    <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
    <div className={`${styles.skeleton} ${styles.skeletonLine1}`} />
    <div className={`${styles.skeleton} ${styles.skeletonLine2}`} />
    <div className={`${styles.skeleton} ${styles.skeletonLine3}`} />
    <div className={styles.skeletonTags}>
      {[60, 70, 50].map(w => (
        <div key={w} className={`${styles.skeleton} ${styles.skeletonTag}`} style={{ width: w }} />
      ))}
    </div>
    <div className={styles.skeletonFooter}>
      <div className={`${styles.skeleton} ${styles.skeletonBtn}`} />
      <div className={`${styles.skeleton} ${styles.skeletonLink}`} />
    </div>
  </div>
);

// ─── Project card ────────────────────────────────────────────────────────────

const ProjectCard = ({ project, onReadme }) => {
  const { name, description, url, language, stars, topics, isPrivate, readme } = project;
  const hasReadme = readme && readme.trim().length > 0;

  return (
    <div className={styles.card}>
      {/* Meta row */}
      <div className={styles.cardMeta}>
        <span className={styles.languageBadge}>
          {language && (
            <>
              <span
                className={styles.languageDot}
                style={{ background: langColor(language) }}
                aria-hidden="true"
              />
              {language}
            </>
          )}
        </span>
        <span className={styles.stars}>
          <FaStar className={styles.starsIcon} aria-hidden="true" />
          {stars ?? 0}
          {isPrivate && (
            <span className={styles.privateBadge}>
              <FaLock aria-hidden="true" />
            </span>
          )}
        </span>
      </div>

      {/* Name */}
      <h3 className={styles.cardName}>{name}</h3>

      {/* Description */}
      {description && (
        <p className={styles.cardDesc}>{description}</p>
      )}

      {/* Topics */}
      {topics?.length > 0 && (
        <div className={styles.topics}>
          {topics.slice(0, 5).map(t => (
            <span key={t} className={styles.topic}>{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        {hasReadme && (
          <LightWaveButton
            className={styles.readmeBtn}
            onClick={() => onReadme(project)}
          >
            README
          </LightWaveButton>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
        >
          <FaGithub className={styles.githubIcon} aria-hidden="true" />
          GitHub
          <MdArrowOutward aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const Projects = () => {
  const { projects, loading, error } = useGitHubProjects();
  const [selected, setSelected] = useState(null);

  const openReadme  = (project) => setSelected(project);
  const closeReadme = ()        => setSelected(null);

  return (
    <section className={styles.page}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.heading}>Notable Projects</h1>
          <p>
            {loading
              ? 'Fetching projects…'
              : projects
                ? `${projects.length} repositories`
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
                ? (
                  <div className={styles.emptyCard}>
                    <p>No projects configured yet.</p>
                  </div>
                )
                : projects?.map(p => (
                  <ProjectCard key={p.id} project={p} onReadme={openReadme} />
                ))
            }
          </div>
        )}
      </div>

      {/* README modal */}
      <Modal
        open={!!selected}
        onClose={closeReadme}
        title={selected?.name}
      >
        {selected?.readme && (
          <ReadmeRenderer markdown={selected.readme} />
        )}
      </Modal>
    </section>
  );
};

export default Projects;
