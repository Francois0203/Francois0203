import { useMemo, useState } from 'react';
import { useGitHubProjects, useStudioSites } from '../../hooks';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import { resolveGroup } from '../../content/copy/resolve';
import { PROJECTS_FIELDS } from '../../content/copy/projects';
import { Modal } from '../../components';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import Showcase, { ShowcaseSkeleton } from '../../components/Showcase';
import Skeleton, { Bone } from '../../components/Skeleton';
import ReadmeRenderer from './ReadmeRenderer';
import Repo from './Repo';
import LangFilter from './LangFilter';
import Tally from './Tally';
import { useCopy } from '../../content/copy/store';
import styles from './Projects.module.css';

const TONES = ['blue', 'green', 'orange', 'pink', 'yellow'];

// The same language always gets the same colour.
const toneOf = (name = '') => TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

const RepoSkeleton = ({ label }) => (
  <Skeleton label={label} className={styles.grid}>
    {[0, 1, 2, 3, 4, 5].map(i => <Bone key={i} h="14rem" r="26px" />)}
  </Skeleton>
);

const Head = ({ title, lede, tone, n }) => {
  const [ref, shown] = useReveal({ threshold: 0.3 });
  return (
    <header ref={ref} className={styles.sectionHead} data-shown={shown ? '' : undefined} data-tone={tone}>
      <span className={styles.num} data-rise aria-hidden="true">{String(n).padStart(2, '0')}</span>
      <Headline as="h2" text={title} tone={tone} start={1} />
      {lede && <p data-rise style={{ '--i': 3 }}>{lede}</p>}
    </header>
  );
};

const Projects = () => {
  const a11y = useCopy('a11y');
  const { projects, loading, error } = useGitHubProjects();
  const { sites, loading: sitesLoading, error: sitesError } = useStudioSites();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(PROJECTS_FIELDS, overrides.projects);

  const [open, setOpen] = useState(null);
  const [lang, setLang] = useState(null);

  const repos = useMemo(() => projects ?? [], [projects]);

  const languages = useMemo(() => {
    const counts = new Map();
    repos.forEach((p) => { if (p.language) counts.set(p.language, (counts.get(p.language) ?? 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [repos]);

  const shown = useMemo(() => (lang ? repos.filter(p => p.language === lang) : repos), [repos, lang]);

  const [headRef, headShown] = useReveal({ threshold: 0 });
  const [reposRef, reposShown] = useReveal({ threshold: 0.03 });

  const tally = [
    { value: sites.length, label: t.statSites, tone: 'green' },
    { value: repos.length, label: t.statRepos, tone: 'blue' },
    { value: languages.length, label: t.statLanguages, tone: 'pink' },
  ];

  return (
    <div className={styles.page}>
      <header ref={headRef} className={styles.hero} data-shown={headShown ? '' : undefined}>
        <div className={styles.heroCopy}>
          <div data-rise style={{ '--i': 0 }}>
            <Chip dot="live">{t.eyebrow}</Chip>
          </div>
          <Headline as="h1" text={t.heading} tone="green" className={styles.title} start={1} />
          <p className={styles.lede} data-rise style={{ '--i': 4 }}>{t.lede}</p>
        </div>
        {!loading && !sitesLoading && <Tally items={tally} shown={headShown} />}
      </header>

      <section className={styles.block} id="sites">
        <Head n={1} tone="green" title={t.studioTitle} lede={t.studioLede} />
        {sitesError
          ? <p className={styles.note}>{t.studioError}</p>
          : sitesLoading
            ? <ShowcaseSkeleton />
            : sites.length === 0
              ? <p className={styles.note}>{t.studioEmpty}</p>
              : <Showcase sites={sites} visitLabel={t.visitLabel} />}
      </section>

      <section
        ref={reposRef}
        className={styles.block}
        id="bench"
        data-shown={reposShown ? '' : undefined}
        style={{ '--step': '45ms' }}
      >
        <Head n={2} tone="blue" title={t.codeTitle} lede={t.codeLede} />

        {languages.length > 1 && (
          <div className={styles.filter} data-rise style={{ '--i': 1 }}>
            <LangFilter
              options={languages}
              value={lang}
              onChange={setLang}
              allLabel={t.filterAll}
              total={repos.length}
              toneOf={toneOf}
            />
          </div>
        )}

        <p className="sr-only" role="status">{lang ? t.filterStatus.replace('{shown}', shown.length).replace('{total}', repos.length).replace('{language}', lang) : ''}</p>

        {error
          ? <p className={styles.note}>{t.codeError}</p>
          : loading
            ? <RepoSkeleton label={a11y.loadingRepos} />
            : shown.length === 0
              ? <p className={styles.note}>{t.codeEmpty}</p>
              : (
                <div key={lang ?? 'all'} className={styles.grid}>
                  {shown.map((p, i) => (
                    <div key={p.id} className={styles.cell} data-rise style={{ '--i': Math.min(i, 10) + 2 }}>
                      <Repo project={p} tone={toneOf(p.language ?? p.name)} labels={t} onReadme={setOpen} />
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
