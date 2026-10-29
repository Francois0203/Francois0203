import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import useStudioSites from '../../hooks/useStudioSites';
import { resolveGroup } from '../../content/copy/resolve';
import { githubAvatar } from '../../content/avatar';
import { HOME_FIELDS } from '../../content/copy/home';
import { PROJECTS_FIELDS } from '../../content/copy/projects';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { periodOf, isCurrent, startKey } from '../../content/records';
import Credentials, { toCredential } from '../../components/Credentials';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import ToyBox from '../../components/ToyBox';
import { iconFor } from '../../content/toys';
import Story from '../../components/Story';
import Curtain from '../../components/Curtain';
import Showcase, { ShowcaseSkeleton } from '../../components/Showcase';
import Skeleton, { Bone } from '../../components/Skeleton';
import styles from './Home.module.css';

const itemLabel = (s) => (typeof s === 'string' ? s : s?.name ?? s?.title ?? String(s));

const onHome = (r) => r?.showOnHome !== false;

const toChapters = ({ experience = [], education = [] }) => {
  const ex = experience.filter(onHome).map(e => ({
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

  const ed = education.filter(onHome).map(e => ({
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

const TOY_TONES = ['yellow', 'green', 'pink', 'orange', 'blue'];

const shortCert = (name) => name.replace(/^AWS Certified\s+/i, '');

const markName = (name) => {
  const parts = name.split(' ');
  return parts.length > 1 ? `${parts.slice(0, -1).join(' ')} *${parts[parts.length - 1]}*` : name;
};

const Home = () => {
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const { sites, loading: sitesLoading } = useStudioSites();
  const t = resolveGroup(HOME_FIELDS, overrides.home);
  const tp = resolveGroup(PROJECTS_FIELDS, overrides.projects);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const name = personal.name ?? 'Francois Meiring';

  const photo = personal.photoUrl || githubAvatar(social);

  const certifications = useMemo(() => data?.certifications ?? [], [data]);
  const nextCert = useMemo(() => certifications.map(toCredential)
    .filter(c => c.status === 'booked' || c.status === 'studying')
    .sort((a, b) => a.order - b.order)[0], [certifications]);

  const role = (data?.experience ?? []).find(isCurrent);

  const chapters = useMemo(() => {
    const list = toChapters(data ?? {});
    if (nextCert) {
      list.push({
        id: 'next',
        kind: t.storyNextKind,
        place: shortCert(nextCert.name),
        what: nextCert.status === 'booked' ? badges.statusBooked : badges.statusStudying,
        period: (nextCert.status === 'booked' && nextCert.date) || String(new Date().getFullYear()),
        start: String(new Date().getFullYear()),
        end: nextCert.status === 'booked' ? nextCert.date : '',
        next: true,
        note: t.storyNextNote,
        tags: certifications.map(toCredential).map(c => c.code).filter(Boolean),
      });
    }
    return list;
  }, [data, nextCert, certifications, t.storyNextKind, t.storyNextNote, badges.statusBooked, badges.statusStudying]);

  const toys = useMemo(() => {
    const raw = data?.interests;
    const interests = (Array.isArray(raw) ? raw : raw?.items ?? []).map(itemLabel).filter(Boolean);
    const words = String(t.toyWords ?? '').split(',').map(w => w.trim()).filter(Boolean);
    return [...new Set([...interests, ...words])]
      .map((label, i) => ({ label, Icon: iconFor(label), tone: TOY_TONES[i % TOY_TONES.length] }));
  }, [data, t.toyWords]);

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

        <div className={styles.heroToys}>
          {!loading && <ToyBox photo={photo} name={name} toys={toys} hint={t.toyHint} hintTouch={t.toyHintTouch} />}
        </div>
      </section>

      {/* 2. How he got here */}
      {loading && (
        <section className={`${styles.block} ${styles.story}`}>
          <header className={styles.head} data-shown="">
            <Headline text={t.storyTitle} tone="blue" className={styles.headTitle} />
          </header>
          <Skeleton label="Loading the story" className={styles.storyWait}>
            <Bone w="min(100%, 340px)" h="auto" r="50%" className={styles.storyWaitRing} style={{ aspectRatio: '1' }} />
            <div className={styles.storyWaitCard}>
              <Bone w="40%" h="0.8rem" />
              <Bone w="70%" h="2.4rem" style={{ marginTop: '1rem' }} />
              <Bone w="50%" h="1.1rem" style={{ marginTop: '0.75rem' }} />
              <Bone w="95%" h="0.9rem" style={{ marginTop: '1.5rem' }} />
              <Bone w="80%" h="0.9rem" style={{ marginTop: '0.5rem' }} />
            </div>
          </Skeleton>
        </section>
      )}

      {chapters.length > 0 && (
        <section id="story" className={`${styles.block} ${styles.story}`}>
          <Story
            chapters={chapters}
            photo={photo}
            name={name}
            nowLabel={t.storyNow}
            kinds={{ experience: t.storyKindWork, education: t.storyKindStudy }}
            head={(
              <header ref={storyRef} className={styles.head} data-shown={storyShown ? '' : undefined}>
                <Headline text={t.storyTitle} tone="blue" className={styles.headTitle} />
                <p className={styles.lede} data-rise style={{ '--i': 4 }}>{t.storyLede}</p>
              </header>
            )}
          />
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
          ? <ShowcaseSkeleton />
          : sites.length === 0
            ? <p className={styles.empty}>{t.workEmpty}</p>
            : <Showcase sites={sites} visitLabel={tp.visitLabel} />}
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
