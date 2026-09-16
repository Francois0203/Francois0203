import { useMemo, useState } from 'react';
import { useGitHubProjects, useStudioSites } from '../../hooks';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import { resolveGroup } from '../../content/copy/resolve';
import { PROJECTS_FIELDS } from '../../content/copy/projects';
import { Modal } from '../../components';
import LiveSite from '../../components/LiveSite';
import Tally from '../../components/Tally';
import ReadmeRenderer from './ReadmeRenderer';
import { parseReadme } from './parseReadme';
import styles from './Projects.module.css';

/*
 * The work. Client sites and personal repositories stay in two sections and
 * are never merged: equal cards would read as equal achievements.
 *
 * Repositories are a ruled list, not a grid. Fourteen cards is a wall.
 */

const buildFigures = ({ sites, repos }) => {
  const stars = repos.reduce((a, p) => a + (p.stars ?? 0), 0);
  const languages = new Set(repos.map(p => p.language).filter(Boolean)).size;

  return [
    sites.length > 0 && { value: sites.length, label: 'Sites in production' },
    repos.length > 0 && { value: repos.length, label: 'Repositories' },
    languages > 0 && { value: languages, label: 'Languages' },
    stars > 0 && { value: stars, label: 'Stars' },
  ].filter(Boolean);
};

const Repo = ({ project, onReadme, index }) => {
  const { name, description, url, language, stars, readme, isPrivate } = project;
  const hasReadme = readme?.trim().length > 0;

  // The README is usually a better summary than the GitHub description.
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
        {language && <span className={styles.lang}>{language}</span>}
        {stars > 0 && <span className={styles.stars}>{stars}</span>}
        {isPrivate && <span className={styles.private}>Private</span>}
        {hasReadme && (
          <button type="button" className={styles.readme} onClick={() => onReadme(project)}>
            Readme
          </button>
        )}
      </div>
    </article>
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

  // Counted across everything: a filter must not change the claim.
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

  const figures = useMemo(() => buildFigures({ sites, repos }), [sites, repos]);

  const [headRef, headShown] = useReveal({ threshold: 0 });
  const [benchRef, benchShown] = useReveal({ threshold: 0.03 });

  return (
    <div className={styles.page}>
      <header
        ref={headRef}
        className={styles.head}
        data-shown={headShown ? '' : undefined}
        style={{ '--step': '80ms' }}
      >
        <p className={styles.eyebrow} data-rise style={{ '--i': 0 }}>{t.eyebrow}</p>
        <h1 className={styles.title}>
          <span className="mask"><span style={{ '--i': 1 }}>{t.heading}</span></span>
        </h1>
        <p className={styles.lede} data-rise style={{ '--i': 2 }}>{t.lede}</p>
      </header>

      {figures.length > 0 && (
        <section className={styles.block}>
          <Tally figures={figures} />
        </section>
      )}

      {/* ── Client work ─────────────────────────────────────────────────── */}
      <section className={styles.block}>
        <header className={styles.sectionHead}>
          <h2>{t.studioTitle}</h2>
          <p>{t.studioLede}</p>
        </header>

        {sitesError
          ? <p className={styles.note}>The client sites could not be loaded.</p>
          : sitesLoading
            ? <div className={styles.waiting} aria-hidden="true" />
            : sites.length === 0
              ? <p className={styles.note}>{t.studioEmpty}</p>
              : sites.map((site, i) => (
                <LiveSite key={site.id} site={site} name={site.name} index={i} />
              ))}
      </section>

      {/* ── The bench ───────────────────────────────────────────────────── */}
      <section
        ref={benchRef}
        className={styles.block}
        data-shown={benchShown ? '' : undefined}
        style={{ '--step': '40ms' }}
      >
        <header className={styles.sectionHead}>
          <h2>{t.codeTitle}</h2>
          <p>{t.codeLede}</p>
        </header>

        {languages.length > 1 && (
          <div className={styles.filter}>
            <button
              type="button"
              className={`${styles.chip} ${lang === null ? styles.chipOn : ''}`}
              onClick={() => setLang(null)}
              aria-pressed={lang === null}
            >
              All<span>{repos.length}</span>
            </button>
            {languages.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className={`${styles.chip} ${lang === name ? styles.chipOn : ''}`}
                onClick={() => setLang(lang === name ? null : name)}
                aria-pressed={lang === name}
              >
                {name}<span>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Announced: the grid it changes may be below the fold. */}
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
                    <div key={p.id} data-rise style={{ '--i': Math.min(i, 10), '--rise': '12px' }}>
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
