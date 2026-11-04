import { useRef } from 'react';
import useTilt from '../../../hooks/useTilt';
import { parseReadme } from '../parseReadme';
import styles from './Repo.module.css';

const GitHubIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 .9 10.2 5.4l5 .7-3.6 3.5.9 5L8 12.3l-4.5 2.3.9-5L.8 6.1l5-.7Z" />
  </svg>
);

// One repository as a glass card. It leans toward the pointer.
const Repo = ({ project, tone, labels, onReadme }) => {
  const ref = useRef(null);
  useTilt(ref, { max: 5, lift: 10 });
  const { name, description, url, language, stars, readme, isPrivate } = project;
  const hasReadme = readme?.trim().length > 0;
  const summary = hasReadme ? parseReadme(readme, { fallback: description ?? '' }).description : description;

  return (
    <article ref={ref} className={`glass ${styles.repo}`} data-tone={tone}>
      <header className={styles.head}>
        <span className={styles.badge} aria-hidden="true">{name.charAt(0)}</span>
        <h3 className={styles.name}>{name}</h3>
      </header>

      {summary && <p className={styles.text}>{summary}</p>}

      <div className={styles.meta}>
        {language && <span className={styles.lang}><span className={styles.dot} aria-hidden="true" />{language}</span>}
        {stars > 0 && <span className={styles.stars}><StarIcon />{stars}</span>}
        {isPrivate && <span className={styles.private}>{labels.privateLabel}</span>}
      </div>

      <div className={styles.actions}>
        {hasReadme && (
          <button type="button" className={styles.action} onClick={() => onReadme(project)}>
            {labels.readmeLabel}
          </button>
        )}
        {url && !isPrivate && (
          <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${labels.repoLabel}: ${name}`} title={labels.repoLabel}>
            <GitHubIcon />
          </a>
        )}
      </div>
      <span className={styles.sheen} aria-hidden="true" />
    </article>
  );
};

export default Repo;
