import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useStudioSites from '../../hooks/useStudioSites';
import { resolveGroup } from '../../content/copy/resolve';
import { githubAvatar } from '../../content/avatar';
import { HOME_FIELDS } from '../../content/copy/home';
import { PROJECTS_FIELDS } from '../../content/copy/projects';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { PHOTOS_FIELDS } from '../../content/copy/photos';
import PhotoTable from '../../components/PhotoTable';
import { periodOf, isCurrent, startKey } from '../../content/records';
import { toCredential } from '../../components/Credentials';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import ToyBox from '../../components/ToyBox';
import { iconFor } from '../../content/toys';
import Story from '../../components/Story';
import SiteDeck, { SiteDeckSkeleton } from '../../components/SiteDeck';
import Skeleton, { Bone } from '../../components/Skeleton';
import styles from './Home.module.css';

const itemLabel = (s) => (typeof s === 'string' ? s : s?.name ?? s?.title ?? String(s));

const onHome = (r) => r?.showOnHome !== false;

const shortCert = (name) => name.replace(/^AWS Certified\s+/i, '');

const toChapters = ({ experience = [], education = [], certifications = [] }, labels = {}) => {
  // An earned certificate is a stop of its own, on the day it was passed.
  const earned = certifications.map(toCredential).filter(c => c.status === 'earned' && c.name).map(c => ({
    id: `cert-${c.id ?? c.code}`,
    place: shortCert(c.name),
    what: [c.issuer, labels.statusEarned].filter(Boolean).join(', '),
    start: c.date,
    end: c.date,
    note: c.note,
    tags: [c.code].filter(Boolean),
    kind: 'certificate',
    badge: { src: c.badgeUrl, verify: c.verifyUrl, verifyLabel: labels.verifyLabel },
    order: c.order,
    key: startKey({ start: c.date }),
  }));

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

  return [...ex, ...ed, ...earned]
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

const markName = (name) => {
  const parts = name.split(' ');
  return parts.length > 1 ? `${parts.slice(0, -1).join(' ')} *${parts[parts.length - 1]}*` : name;
};

const Home = () => {
  const { data, loading } = usePortfolioData();
  const { overrides, copy } = useSiteCopy();
  const { sites, loading: sitesLoading } = useStudioSites();
  const t = resolveGroup(HOME_FIELDS, overrides.home);
  const tp = resolveGroup(PROJECTS_FIELDS, overrides.projects);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);
  const tph = resolveGroup(PHOTOS_FIELDS, overrides.photos);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const name = personal.name || copy('site').name;

  const photo = personal.photoUrl || githubAvatar(social);

  const certifications = useMemo(() => data?.certifications ?? [], [data]);
  const nextCert = useMemo(() => certifications.map(toCredential)
    .filter(c => c.status === 'booked' || c.status === 'studying')
    .sort((a, b) => a.order - b.order)[0], [certifications]);

  const role = (data?.experience ?? []).find(isCurrent);

  const allPhotos = useMemo(() => data?.photos ?? [], [data]);
  const homePhotos = useMemo(() => allPhotos.filter(p => p.onHome !== false && p.src && !p.chapter), [allPhotos]);
  const photosFor = useMemo(() => {
    const map = {};
    allPhotos.filter(p => p.chapter && p.src).forEach((p) => { (map[p.chapter] ??= []).push(p); });
    return map;
  }, [allPhotos]);

  const chapters = useMemo(() => {
    const list = toChapters(data ?? {}, { statusEarned: badges.statusEarned, verifyLabel: badges.verifyLabel });
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
  }, [data, nextCert, certifications, t.storyNextKind, t.storyNextNote, badges.statusBooked, badges.statusStudying, badges.statusEarned, badges.verifyLabel]);

  const toys = useMemo(() => {
    const raw = data?.interests;
    const interests = (Array.isArray(raw) ? raw : raw?.items ?? []).map(itemLabel).filter(Boolean);
    const words = String(t.toyWords ?? '').split(',').map(w => w.trim()).filter(Boolean);
    return [...new Set([...interests, ...words])]
      .map((label, i) => ({ label, Icon: iconFor(label), tone: TOY_TONES[i % TOY_TONES.length] }));
  }, [data, t.toyWords]);

  const chip = contact.availability?.status === 'open' ? t.availabilityLabel : (role ? String(role.role).toLowerCase() : 'devops and software engineering');

  const workHead = (
    <header className={styles.head}>
      <Headline text={t.curtainLabel} tone="green" className={styles.headTitle} />
      <p className={styles.lede} data-rise style={{ '--i': 3 }}>{t.workLede}</p>
    </header>
  );

  return (
    <div className={styles.page}>

      {/* Hello: the name over a shelf of toys that runs the whole width */}
      <section className={styles.hero}>
        <div className={styles.heroToys} data-rise style={{ '--i': 2, '--rise': '30px' }}>
          {loading
            ? <div className={styles.heroWait}><Bone w="min(36%, 430px)" h="auto" r="50%" style={{ aspectRatio: '1' }} /></div>
            : <ToyBox wide photo={photo} name={name} toys={toys} hint={t.toyHint} hintTouch={t.toyHintTouch} />}
        </div>

        <div className={styles.heroCopy}>
          <Headline as="h1" text={markName(name)} tone="yellow" className={styles.name} start={0} />

          <p className={styles.intro} data-rise style={{ '--i': 3 }}>{t.heroIntro}</p>

          <div className={styles.actions} data-rise style={{ '--i': 4 }}>
            <Button as={Link} to="/projects" variant="primary" size="lg" arrow>{t.heroCtaPrimary}</Button>
            <Button as={Link} to="/connect" variant="soft" size="lg">{t.heroCtaSecondary}</Button>
            <Chip dot="live">{chip}</Chip>
          </div>
        </div>
      </section>

      {/* What he has built */}
      <section id="work" className={styles.block}>
        {sitesLoading
          ? <SiteDeckSkeleton head={workHead} />
          : sites.length === 0
            ? <>{workHead}<p className={styles.empty}>{t.workEmpty}</p></>
            : (
              <SiteDeck
                sites={sites}
                visitLabel={tp.visitLabel}
                listLabel={t.workListLabel}
                head={workHead}
                more={<Button as={Link} to="/projects" variant="text" arrow>{t.workCta}</Button>}
              />
            )}
      </section>

      {/* How he got here */}
      {loading && (
        <section className={`${styles.block} ${styles.story}`}>
          <Skeleton label={copy('a11y').loadingStory} className={styles.storyWait}>
            <Bone w="min(100%, 330px)" h="auto" r="50%" className={styles.storyWaitRing} style={{ aspectRatio: '1' }} />
            <div className={`panel ${styles.storyWaitCard}`}>
              <Bone w="40%" h="0.8rem" />
              <Bone w="70%" h="2.4rem" style={{ marginTop: '1rem' }} />
              <Bone w="50%" h="1.1rem" style={{ marginTop: '0.75rem' }} />
              <Bone w="95%" h="0.9rem" style={{ marginTop: '1.5rem' }} />
              <Bone w="80%" h="0.9rem" style={{ marginTop: '0.5rem' }} />
            </div>
          </Skeleton>
        </section>
      )}
      {loading && (
        <section className={`${styles.block} ${styles.photos}`}>
          <Skeleton label={copy('a11y').loadingStory} className={styles.photosWait}>
            <Bone w="min(50%, 20rem)" h="2.6rem" />
            <div className={styles.photosWaitRow}>
              {[-4, 3, -2, 5].map(r => <Bone key={r} h="auto" r="14px" style={{ aspectRatio: '4 / 5', rotate: `${r}deg` }} />)}
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
            kinds={{ experience: t.storyKindWork, education: t.storyKindStudy, certificate: t.storyKindCert }}
            photosFor={photosFor}
            photosLabel={tph.storyPhotos}
            viewerLabels={{ close: tph.viewerClose, next: tph.viewerNext, prev: tph.viewerPrev }}
            head={(
              <header className={styles.head}>
                <Headline text={t.storyTitle} tone="blue" className={styles.headTitle} />
                <p className={styles.lede} data-rise style={{ '--i': 4 }}>{t.storyLede}</p>
              </header>
            )}
          />
        </section>
      )}

      {/* Off the clock */}
      {homePhotos.length > 0 && (
        <section id="photos" className={`${styles.block} ${styles.photos}`}>
          <header className={styles.headRow}>
            <div className={styles.head}>
              <Headline text={tph.homeTitle} tone="orange" className={styles.headTitle} />
              <p className={styles.lede} data-rise style={{ '--i': 4 }}>
                {tph.homeLede} <span className={styles.hintFine}>{tph.homeHint}</span><span className={styles.hintTouch}>{tph.homeHintTouch}</span>
              </p>
            </div>
            <div data-rise style={{ '--i': 6 }}>
              <Button as={Link} to="/bio#interests" variant="text" arrow>{tph.homeMore}</Button>
            </div>
          </header>
          <PhotoTable
            photos={homePhotos}
            labels={{ close: tph.viewerClose, next: tph.viewerNext, prev: tph.viewerPrev }}
          />
        </section>
      )}
    </div>
  );
};

export default Home;
