import { useMemo, useState } from 'react';
import { useGitHubProjects, useStudioSites } from '../../hooks';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import { resolveGroup } from '../../content/copy/resolve';
import { PROJECTS_FIELDS } from '../../content/copy/projects';
import { Modal } from '../../components';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import Drift from '../../components/Drift';
import Fleet from '../../components/Fleet';
import ReadmeRenderer from './ReadmeRenderer';
import { parseReadme } from './parseReadme';
import styles from './Projects.module.css';

const Repo = ({ project, onReadme, index }) => {
  const { name, description, url, language, stars, readme, isPrivate } = project;
  const hasReadme = readme?.trim().length > 0;
  const summary = hasReadme
    ? parseReadme(readme, { fallback: description ?? '' }).description
    : description;

  return (
    <article className={styles.repo}>
      <span className={styles.repoIndex}>{String(index + 1).padStart(2, '0')}</span>

      <div className={styles.repoBody}>
        <h3 className={styles.repoName}>
          <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>
        </h3>
        {summary && <p className={styles.repoText}>{summary}</p>}
      </div>

      <div className={styles.repoMeta}>
        {language && <Chip>{language}</Chip>}
        {stars > 0 && <span className={styles.stars}>{stars} ★</span>}
        {isPrivate && <span className={styles.private}>private</span>}
        {hasReadme && (
          <button type="button" className={styles.readme} onClick={() => onReadme(project)}>
            readme
          </button>
        )}
      </div>
    </article>
  );
};

const Head = ({ title, lede }) => {
  const [ref, shown] = useReveal({ threshold: 0.3 });
  return (
    <header ref={ref} className={styles.sectionHead} data-shown={shown ? '' : undefined}>
      <Headline as="h2" text={title} />
      {lede && <p data-rise style={{ '--i': 3 }}>{lede}</p>}
    </header>
  );
};

const Projects = () => {
  const { projects, loading, error } = useGitHubProjects();
  const { sites, loading: sitesLoading, error: sitesError } = useStudioSites();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(PROJECTS_FIELDS, overrides.projects);

  const [open, setOpen] = useState(null);
  const [lang, setLang] = useState(null);

  const repos = projects ?? [];

  const languages = useMemo(() => {
    const counts = new Map();
    repos.forEach(p => {
      if (!p.language) return;
      counts.set(p.language, (counts.get(p.language) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [repos]);

  const shown = useMemo(
    () => (lang ? repos.filter(p => p.language === lang) : repos),
    [repos, lang],
  );

  const [headRef, headShown] = useReveal({ threshold: 0 });
  const [reposRef, reposShown] = useReveal({ threshold: 0.03 });

  return (
    <div className={styles.page}>
      <Drift shapes={[
        { kind: 'hexagon', colour: 'green', x: '100%', y: '150px', size: 'clamp(180px, 22vw, 320px)', speed: 0.6, spin: 25, wide: true },
      ]} />
      <header
        ref={headRef}
        className={styles.head}
        data-shown={headShown ? '' : undefined}
      >
        <div data-rise style={{ '--i': 0 }}>
          <Chip dot="ink">{t.eyebrow}</Chip>
        </div>
        <Headline as="h1" text={t.heading} tone="green" className={styles.title} start={1} />
        <p className={styles.lede} data-rise style={{ '--i': 5 }}>{t.lede}</p>
      </header>

      {/* Client sites */}
      <section className={styles.block} id="sites">
        <Head title={t.studioTitle} lede={t.studioLede} />

        {sitesError
          ? <p className={styles.note}>The client sites could not be loaded.</p>
          : sitesLoading
            ? <div className={styles.waiting} aria-hidden="true" />
            : sites.length === 0
              ? <p className={styles.note}>{t.studioEmpty}</p>
              : <Fleet sites={sites} />}
      </section>

      {/* Repositories */}
      <section
        ref={reposRef}
        className={styles.block}
        id="bench"
        data-shown={reposShown ? '' : undefined}
        style={{ '--step': '40ms' }}
      >
        <Head title={t.codeTitle} lede={t.codeLede} />

        {languages.length > 1 && (
          <div className={styles.filter}>
            <button
              type="button"
              className={`${styles.chip} ${lang === null ? styles.chipOn : ''}`}
              onClick={() => setLang(null)}
              aria-pressed={lang === null}
            >
              all<span>{repos.length}</span>
            </button>
            {languages.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className={`${styles.chip} ${lang === name ? styles.chipOn : ''}`}
                onClick={() => setLang(lang === name ? null : name)}
                aria-pressed={lang === name}
              >
                {name.toLowerCase()}<span>{count}</span>
              </button>
            ))}
          </div>
        )}

        <p className={styles.status} role="status">
          {lang ? `${shown.length} of ${repos.length} repositories, in ${lang}.` : ''}
        </p>

        {error
          ? <p className={styles.note}>The repositories could not be loaded.</p>
          : loading
            ? <div className={styles.waiting} aria-hidden="true" />
            : shown.length === 0
              ? <p className={styles.note}>{t.codeEmpty}</p>
              : (
                <div className={styles.repos}>
                  {shown.map((p, i) => (
                    <div key={p.id} data-rise style={{ '--i': Math.min(i, 10) }}>
                      <Repo project={p} index={i} onReadme={setOpen} />
                    </div>
                  ))}
                </div>
              )}
      </section>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name} size="lg">
        {open?.readme && <ReadmeRenderer markdown={open.readme} />}
      </Modal>
    </div>
  );
};

export default Projects;
