import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import useStudioSites from '../../hooks/useStudioSites';
import { resolveGroup } from '../../content/copy/resolve';
import { HOME_FIELDS } from '../../content/copy/home';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { periodOf, isCurrent, startKey } from '../../content/records';
import Credentials, { toCredential, onPath } from '../../components/Credentials';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import Portrait from '../../components/Portrait';
import Story from '../../components/Story';
import RunsOn from '../../components/RunsOn';
import Curtain from '../../components/Curtain';
import Fleet from '../../components/Fleet';
import styles from './Home.module.css';


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

const toChapters = ({ experience = [], education = [] }) => {
  const ex = experience.map(e => ({
    id: `exp-${e.id}`,
    place: e.company,
    what: e.role,
    period: periodOf(e),
    start: e.start,
    end: e.end,
    note: e.description,
    tags: e.tags ?? [],
    kind: 'experience',
    order: e.order ?? 0,
    key: startKey(e),
  }));

  const ed = education.map(e => ({
    id: `edu-${e.id}`,
    place: e.institution,
    what: [e.degree, e.field].filter(Boolean).join(', '),
    period: periodOf(e),
    start: e.start,
    end: e.end,
    note: e.description,
    tags: e.tags ?? [],
    kind: 'education',
    order: e.order ?? 0,
    key: startKey(e),
  }));

  return [...ex, ...ed]
    .sort((a, b) => {
      if (a.key !== null && b.key !== null) return a.key - b.key;
      if (a.key === null && b.key === null) {
        if (a.kind !== b.kind) return a.kind === 'experience' ? -1 : 1;
        return b.order - a.order;
      }
      return a.key === null ? -1 : 1;
    });
};

const shortCert = (name) => name.replace(/^AWS Certified\s+/i, '');

const markName = (name) => {
  const parts = name.split(' ');
  return parts.length > 1 ? `${parts.slice(0, -1).join(' ')} *${parts[parts.length - 1]}*` : name;
};

const Home = () => {
  const { data } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const { sites, loading: sitesLoading } = useStudioSites();
  const t = resolveGroup(HOME_FIELDS, overrides.home);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const name = personal.name ?? 'Francois Meiring';

  const github = social.find(s => (s.key || '').toLowerCase() === 'github');
  const user = github?.url ? github.url.replace(/\/$/, '').split('/').pop() : null;
  const photo = personal.photoUrl || (user ? `https://github.com/${user}.png` : null);

  const certifications = useMemo(() => (data?.certifications ?? []).filter(onPath), [data]);
  const nextCert = useMemo(() => certifications.map(toCredential)
    .filter(c => c.status === 'booked' || c.status === 'studying')
    .sort((a, b) => a.order - b.order)[0], [certifications]);

  const role = (data?.experience ?? []).find(isCurrent);
  const study = (data?.education ?? []).find(isCurrent);

  const tools = useMemo(() => {
    const all = flattenSkills(data?.skills).map(s => s.label);
    return [...new Set(all)].slice(0, 16);
  }, [data]);

  const chapters = useMemo(() => {
    const list = toChapters(data ?? {});
    if (nextCert) {
      list.push({
        id: 'next',
        kind: t.storyNextKind,
        place: shortCert(nextCert.name),
        what: nextCert.status === 'booked' ? badges.statusBooked : badges.statusStudying,
        period: nextCert.examDate || String(new Date().getFullYear()),
        start: String(new Date().getFullYear()),
        end: nextCert.examDate || '',
        next: true,
        note: t.storyNextNote,
        tags: certifications.map(toCredential).map(c => c.code).filter(Boolean),
      });
    }
    return list;
  }, [data, nextCert, certifications, t.storyNextKind, t.storyNextNote, badges.statusBooked, badges.statusStudying]);

  const facts = [
    role && { key: 'now at', text: role.company, live: true, depth: 1.4 },
    contact.location && { key: 'based', text: contact.location, depth: 0.8 },
    nextCert && { key: nextCert.code.toLowerCase(), text: nextCert.status === 'booked' ? badges.statusBooked : badges.statusStudying, depth: 1.8 },
    study && { key: 'studying', text: [study.degree, study.field].filter(Boolean).join(' ') || study.institution, depth: 1.1 },
  ].filter(Boolean);

  const chip = contact.availability?.status === 'open' ? t.availabilityLabel : (role ? String(role.role).toLowerCase() : 'devops and software engineering');

  const [heroRef, heroShown] = useReveal({ threshold: 0 });
  const [storyRef, storyShown] = useReveal({ threshold: 0.3 });
  const [workRef, workShown] = useReveal({ threshold: 0.3 });
  const [pathRef, pathShown] = useReveal({ threshold: 0.3 });

  return (
    <div className={styles.page}>

      {/* 1. Who */}
      <section ref={heroRef} className={styles.hero} data-shown={heroShown ? '' : undefined}>
        <div className={styles.heroCopy}>
          <div data-rise style={{ '--i': 0 }}>
            <Chip dot="live">{chip}</Chip>
          </div>

          <Headline as="h1" text={markName(name)} tone="yellow" className={styles.name} start={1} />

          <p className={styles.intro} data-rise style={{ '--i': 4 }}>{t.heroIntro}</p>

          <div className={styles.actions} data-rise style={{ '--i': 5 }}>
            <Button as={Link} to="/projects" variant="fill" arrow>{t.heroCtaPrimary}</Button>
            <Button as={Link} to="/connect" variant="line">{t.heroCtaSecondary}</Button>
          </div>
        </div>

        <div className={styles.heroPortrait} data-rise style={{ '--i': 2, '--rise': '28px' }}>
          <Portrait src={photo} name={name} facts={facts} />
        </div>
      </section>

      {/* Tools */}
      {tools.length > 0 && (
        <section className={`${styles.block} ${styles.toolsBlock}`}>
          <RunsOn label={t.runsOnTitle} items={tools} />
        </section>
      )}

      {/* 2. How he got here */}
      {chapters.length > 0 && (
        <section id="story" className={`${styles.block} ${styles.story}`}>
          <header ref={storyRef} className={styles.head} data-shown={storyShown ? '' : undefined}>
            <Headline text={t.storyTitle} tone="blue" className={styles.headTitle} />
            <p className={styles.lede} data-rise style={{ '--i': 4 }}>{t.storyLede}</p>
          </header>
          <Story chapters={chapters} photo={photo} name={name} />
        </section>
      )}

      {/* Interval */}
      <Curtain label={t.curtainLabel} />

      {/* 3. What he has built */}
      <section id="work" className={styles.block}>
        <header ref={workRef} className={styles.headRow} data-shown={workShown ? '' : undefined}>
          <p className={styles.lede} data-rise style={{ '--i': 1 }}>{t.workLede}</p>
          <div data-rise style={{ '--i': 5 }}>
            <Button as={Link} to="/projects" variant="text" arrow>{t.workCta}</Button>
          </div>
        </header>
        {sitesLoading
          ? <div className={styles.waiting} aria-hidden="true" />
          : sites.length === 0
            ? <p className={styles.empty}>{t.workEmpty}</p>
            : <Fleet sites={sites} />}
      </section>

      {/* 4. What is next */}
      {certifications.length > 0 && (
        <section id="certifications" className={styles.block}>
          <header ref={pathRef} className={styles.head} data-shown={pathShown ? '' : undefined}>
            <Headline text={badges.title} tone="pink" className={styles.headTitle} />
            <p className={styles.lede} data-rise style={{ '--i': 4 }}>{badges.lede}</p>
          </header>
          <Credentials items={certifications} labels={badges} />
        </section>
      )}
    </div>
  );
};

export default Home;
