import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import useStudioSites from '../../hooks/useStudioSites';
import { resolveGroup } from '../../content/copy/resolve';
import { HOME_FIELDS } from '../../content/copy/home';
import Button from '../../components/Button';
import LiveSite from '../../components/LiveSite';
import Tally from '../../components/Tally';
import Stack from '../../components/Stack';
import Route from '../../components/Route';
import styles from './Home.module.css';

/*
 * Home. Six blocks, no two built the same way, two of them whole sections
 * of deep ground so the page alternates rather than running as one scroll.
 *
 * Nothing animates an ancestor of a live iframe: opacity or a transform
 * above one forces it to rasterise into the parent layer every frame.
 */

const itemLabel = (s) => (typeof s === 'string' ? s : s?.name ?? s?.title ?? String(s));

const flattenSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills.categories))
    return skills.categories.flatMap(c => (c.items ?? []).map(i => ({ label: itemLabel(i), group: c.name })));
  if (Array.isArray(skills.items))
    return skills.items.map(i => ({ label: itemLabel(i), group: null }));
  return Object.entries(skills)
    .filter(([, v]) => Array.isArray(v))
    .flatMap(([name, arr]) => arr.map(i => ({ label: itemLabel(i), group: name })));
};

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'];

/* Year * 12 + month, so two entries starting the same year do not tie.
   Only a month written before the year belongs to the start. */
const startKey = (record) => {
  const text = String(record.start || record.period || '');
  const year = /\b(19|20)\d{2}\b/.exec(text);
  if (!year) return null;
  const head = text.slice(0, year.index).toLowerCase();
  const month = MONTHS.findIndex(m => head.includes(m.slice(0, 3)));
  return Number(year[0]) * 12 + (month >= 0 ? month : 0);
};

const toRoute = ({ experience = [], education = [] }) => {
  const ex = experience.map(e => ({
    id: `exp-${e.id}`,
    place: e.company || e.employer || e.organisation || 'Role',
    what: e.role || e.position || e.title,
    period: e.period || e.dates || null,
    note: e.description || e.summary,
    kind: 'experience',
    order: e.order ?? 0,
  }));

  const ed = education.map(e => ({
    id: `edu-${e.id}`,
    place: e.institution || e.school || e.university || 'Education',
    what: [e.degree || e.qualification, e.field || e.major].filter(Boolean).join(', '),
    period: e.period || e.dates || null,
    note: e.description || e.summary,
    kind: 'education',
    order: e.order ?? 0,
  }));

  /* Oldest first: it is a journey, and the rail that draws as you scroll
     only means anything travelled forwards. Undated entries are the school
     era ones and sort to the front, experience before education. */
  return [...ex, ...ed]
    .map(s => ({ ...s, key: startKey(s) }))
    .sort((a, b) => {
      if (a.key !== null && b.key !== null) return a.key - b.key;
      if (a.key === null && b.key === null) {
        if (a.kind !== b.kind) return a.kind === 'experience' ? -1 : 1;
        return b.order - a.order;
      }
      return a.key === null ? -1 : 1;
    });
};

/* Counted from real records. Anything that cannot be derived is left out
   rather than estimated. */
const buildFigures = ({ experience, education, skills, sites, projects }) => {
  const years = (() => {
    const found = [...experience, ...education]
      .map(e => /\b(19|20)\d{2}\b/.exec(String(e.period ?? '')))
      .filter(Boolean).map(m => Number(m[0]));
    return found.length ? new Date().getFullYear() - Math.min(...found) : null;
  })();

  const built = (sites?.length ?? 0) + (projects?.length ?? 0);

  return [
    years !== null && { value: years, label: 'Years in the work' },
    skills.length > 0 && { value: skills.length, label: 'Tools in regular use' },
    education.length > 0 && { value: education.length, label: 'Qualifications' },
    built > 0 && { value: built, label: 'Sites and repositories' },
  ].filter(Boolean);
};

const Home = () => {
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const { featured, loading: sitesLoading } = useStudioSites({ featuredLimit: 3 });
  const t = resolveGroup(HOME_FIELDS, overrides.home);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];

  const github = social.find(s => (s.key || '').toLowerCase() === 'github');
  const user = github?.url ? github.url.replace(/\/$/, '').split('/').pop() : null;
  const photo = personal.photoUrl || (user ? `https://github.com/${user}.png` : null);

  const skills = useMemo(() => flattenSkills(data?.skills), [data]);
  const route = useMemo(() => toRoute(data ?? {}), [data]);

  const figures = useMemo(() => buildFigures({
    experience: data?.experience ?? [],
    education: data?.education ?? [],
    skills,
    sites: featured ?? [],
    projects: data?.projects ?? [],
  }), [data, skills, featured]);

  // The same "present" test the route uses, so the two cannot disagree.
  const now = useMemo(() => {
    const present = /present/i;
    return [
      (data?.experience ?? []).find(e => present.test(String(e.period ?? ''))),
      (data?.education ?? []).find(e => present.test(String(e.period ?? ''))),
    ].filter(Boolean);
  }, [data]);

  const available = contact.availability?.status === 'open';
  const name = personal.name ?? 'Francois Meiring';
  const [first, ...rest] = name.split(' ');

  const [openRef, openShown] = useReveal({ threshold: 0 });
  const [sayRef, sayShown] = useReveal({ threshold: 0.2 });
  const [workRef, workShown] = useReveal({ threshold: 0.05 });

  return (
    <div className={styles.page}>

      {/* 1. The opening */}
      <section
        ref={openRef}
        className={styles.open}
        data-shown={openShown ? '' : undefined}
        style={{ '--step': '90ms' }}
      >
        {photo && (
          <div className={styles.portrait} aria-hidden="true">
            <img src={photo} alt="" width="900" height="1200" fetchPriority="high" />
          </div>
        )}

        <p className={styles.role} data-rise style={{ '--i': 0 }}>{t.heroLede}</p>

        <h1 className={styles.name}>
          <span className="mask"><span style={{ '--i': 1 }}>{first}</span></span>
          {rest.length > 0 && (
            <span className="mask"><span style={{ '--i': 2 }}>{rest.join(' ')}</span></span>
          )}
        </h1>

        <div className={styles.openFoot}>
          <p className={styles.say} data-rise style={{ '--i': 3 }}>{t.heroStatement}</p>

          <div className={styles.openActions} data-rise style={{ '--i': 4 }}>
            <Button as={Link} to="/projects" variant="fill">{t.heroCtaPrimary}</Button>
            <Button as={Link} to="/connect" variant="line">{t.heroCtaSecondary}</Button>
          </div>

          {available && (
            <p className={styles.open_available} data-rise style={{ '--i': 5 }}>
              {t.availabilityLabel}
            </p>
          )}
        </div>
      </section>

      {/* 2. The statement. A whole section on the deep ground. */}
      <section
        ref={sayRef}
        id="about"
        className={`${styles.band} on-deep`}
        data-shown={sayShown ? '' : undefined}
        style={{ '--step': '110ms' }}
      >
        <div className={styles.blockInner}>
          <h2 className={styles.statement}>
            {String(t.statementBody).split('. ').filter(Boolean).map((line, i) => (
              <span className="mask" key={i}>
                <span style={{ '--i': i }}>{line.endsWith('.') ? line : `${line}.`}</span>
              </span>
            ))}
          </h2>

          {now.length > 0 && (
            <dl className={styles.now} data-rise style={{ '--i': 4 }}>
              <dt className="label">{t.nowTitle}</dt>
              {now.map((entry, i) => (
                <dd key={i}>
                  <strong>
                    {entry.role || entry.position || entry.degree || entry.qualification}
                  </strong>
                  <span>
                    {entry.company || entry.employer || entry.institution || entry.university}
                  </span>
                </dd>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* 3. The ledger */}
      {figures.length > 0 && (
        <section className={styles.block}>
          <Tally figures={figures} />
        </section>
      )}

      {/* 4. The work. Live cross origin iframes: nothing above them animates. */}
      <section
        ref={workRef}
        className={styles.block}
        data-shown={workShown ? '' : undefined}
      >
        <header className={styles.head}>
          <h2>{t.workTitle}</h2>
          <p>{t.workLede}</p>
          <Button as={Link} to="/projects" variant="text">{t.workCta}</Button>
        </header>

        {sitesLoading
          ? <div className={styles.waiting} aria-hidden="true" />
          : featured.length === 0
            ? <p className={styles.empty}>{t.workEmpty}</p>
            : featured.map((site, i) => (
              <LiveSite key={site.id} site={site} name={site.name} index={i} />
            ))}
      </section>

      {/* 5. The stack, on the deep ground. */}
      {(loading || skills.length > 0) && (
        <section id="capabilities" className={`${styles.band} on-deep`}>
          <div className={styles.bandInner}>
            <header className={styles.head}>
              <h2>{t.toolkitTitle}</h2>
            </header>
            {loading && skills.length === 0
            ? (
              <div className={styles.stackSkeleton} aria-hidden="true">
                {[0, 1, 2].map(i => <span key={i} />)}
              </div>
            )
            : <Stack entries={skills} />}
          </div>
        </section>
      )}

      {/* 6. The route so far */}
      <section className={styles.block}>
        <header className={styles.head}>
          <h2>{t.journeyTitle}</h2>
          <p>{t.journeyLede}</p>
        </header>
        {route.length === 0
          ? <p className={styles.empty}>{t.journeyEmpty}</p>
          : <Route stops={route} />}
      </section>
    </div>
  );
};

export default Home;
