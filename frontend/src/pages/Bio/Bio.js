import { useMemo } from 'react';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useActiveSection from '../../hooks/useActiveSection';
import useCvDownload from '../../hooks/useCvDownload';
import { resolveGroup } from '../../content/copy/resolve';
import { githubAvatar } from '../../content/avatar';
import { BIO_FIELDS } from '../../content/copy/bio';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { PHOTOS_FIELDS } from '../../content/copy/photos';
import { periodOf, isCurrent } from '../../content/records';
import Skeleton, { Bone } from '../../components/Skeleton';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Glass from '../../components/Glass';
import Draggable from '../../components/Draggable';
import SocialIcon from '../../components/SocialIcon';
import Credentials from '../../components/Credentials';
import Stack from '../../components/Stack';
import Gallery from '../../components/Gallery';
import Chapter from './Chapter';
import Rail from '../../components/Rail';
import Contents from './Contents';
import Job from './Job';
import Course from './Course';
import { useCopy } from '../../content/copy/store';
import styles from './Bio.module.css';

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

const TONES = ['blue', 'green', 'orange', 'pink', 'yellow'];

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

// The record while it loads: a paragraph and two cards.
const RecordSkeleton = ({ label }) => (
  <Skeleton label={label} className={styles.wait}>
    <Bone w="11rem" h="2.6rem" />
    {[100, 96, 98, 60].map((w, i) => <Bone key={i} w={`${w}%`} h="1rem" />)}
    {[0, 1].map(i => <Bone key={`c${i}`} h="9rem" r="var(--r-card)" style={{ marginTop: '1rem' }} />)}
  </Skeleton>
);

const Bio = () => {
  const a11y = useCopy('a11y');
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(BIO_FIELDS, overrides.bio);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);
  const tph = resolveGroup(PHOTOS_FIELDS, overrides.photos);
  const photos = useMemo(() => (data?.photos ?? []).filter(p => p.src), [data]);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const experience = data?.experience ?? [];
  const education = data?.education ?? [];
  const certifications = data?.certifications ?? [];

  const skills = useMemo(() => flattenSkills(data?.skills), [data]);
  const interests = useMemo(() => {
    const raw = data?.interests;
    return (Array.isArray(raw) ? raw : raw?.items ?? []).map(itemLabel).filter(Boolean);
  }, [data]);
  const languages = useMemo(() => (personal.languages ?? []).map(itemLabel).filter(Boolean), [personal]);

  const photo = personal.photoUrl || githubAvatar(social);
  const name = personal.name ?? '';
  const summary = personal.summary || t.lede;

  const cv = useCvDownload();

  const contents = [
    { id: 'profile', label: t.profileHeading, tone: 'blue' },
    experience.length > 0 && { id: 'experience', label: t.experienceHeading, tone: 'green' },
    education.length > 0 && { id: 'education', label: t.educationHeading, tone: 'orange' },
    certifications.length > 0 && { id: 'certifications', label: t.certificationsHeading, tone: 'pink' },
    skills.length > 0 && { id: 'skills', label: t.skillsHeading, tone: 'yellow' },
    (interests.length > 0 || languages.length > 0 || photos.length > 0) && { id: 'interests', label: t.interestsHeading, tone: 'blue' },
  ].filter(Boolean);
  const number = (id) => contents.findIndex(c => c.id === id) + 1;

  const idKey = contents.map(c => c.id).join('|');
  const ids = useMemo(() => idKey.split('|'), [idKey]);
  const active = useActiveSection(ids);

  return (
    <div className={styles.page}>
      <header className={styles.hero} style={{ '--step': '70ms' }}>
        <div className={styles.intro}>
          <div data-rise style={{ '--i': 0 }}>
            <Chip dot="live">{t.eyebrow}</Chip>
          </div>

          {loading ? (
            <>
              <Bone w="min(26rem, 80%)" h="4rem" />
              <Bone w="14rem" h="1.3rem" />
            </>
          ) : (
            <>
              <h1 className={styles.name}>
                {name.split(' ').map((w, i) => (
                  <span key={i} className="mask"><span style={{ '--i': i + 1 }}>{w}</span></span>
                )).reduce((a, b, i) => (i ? [...a, ' ', b] : [b]), [])}
              </h1>
              {personal.title && <p className={styles.role} data-rise style={{ '--i': 3 }}>{personal.title}</p>}
            </>
          )}

          <div className={styles.actions} data-rise data-print-hide style={{ '--i': 4 }}>
            <Button
              variant="primary"
              tone="blue"
              size="lg"
              icon={<DownloadIcon />}
              status={cv.status}
              disabled={loading || !data}
              onClick={() => cv.run()}
            >
              {t.printLabel}
            </Button>
          </div>

          <ul className={styles.contact} data-rise style={{ '--i': 5 }}>
            {loading && [0, 1, 2].map(i => <li key={i}><Bone w="12rem" h="2.6rem" r="999px" /></li>)}
            {contact.location && (
              <li className={styles.pill} data-tone="green">
                <span className={styles.pillKey}>{t.basedLabel}</span>
                <span className={styles.pillVal}>{contact.location}</span>
              </li>
            )}
            {contact.email && (
              <li>
                <a className={styles.pill} data-tone="blue" href={`mailto:${contact.email}`}>
                  <span className={styles.pillKey}>{t.emailLabel}</span>
                  <span className={styles.pillVal}>{contact.email}</span>
                </a>
              </li>
            )}
            {contact.phone && (
              <li>
                <a className={styles.pill} data-tone="orange" href={`tel:${String(contact.phone).split(' ').join('')}`}>
                  <span className={styles.pillKey}>{t.phoneLabel}</span>
                  <span className={styles.pillVal}>{contact.phone}</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className={styles.cardWrap} data-rise style={{ '--i': 2, '--rise': '40px' }}>
          <Glass tone="pink" tilt={9} lift={18} pad="none" className={styles.card}>
            <div className={styles.portrait}>
              {loading ? <Bone w="100%" h="100%" r="0" /> : photo && (
                <img src={photo} alt={name} width="480" height="480" fetchPriority="high" />
              )}
            </div>
            <div className={styles.cardFoot}>
              <div className={styles.cardName}>
                <strong>{name}</strong>
                {personal.title && <span>{personal.title}</span>}
              </div>
              {social.length > 0 && (
                <div className={styles.social} data-tones>
                  {social.map((s, i) => (
                    <a
                      key={s.key ?? i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={s.platform || s.key}
                      title={s.platform || s.key}
                    >
                      <SocialIcon platform={s.key} url={s.url} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Glass>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.rail}>
          <Contents title={t.contentsLabel} items={contents} active={active} />
        </aside>

        <div className={styles.record}>
          {loading ? <RecordSkeleton label={a11y.loadingCv} /> : (
            <Chapter id="profile" n={number('profile')} title={t.profileHeading} tone="blue">
              <Glass tone="blue" pad="lg" className={styles.summary} data-rise="flip" style={{ '--i': 2 }}>
                <p>{summary}</p>
              </Glass>
            </Chapter>
          )}

          {experience.length > 0 && (
            <Chapter id="experience" n={number('experience')} title={t.experienceHeading} tone="green">
              <div className={styles.timeline}>
                <Rail />
                {experience.map((e, i) => (
                  <Job
                    key={e.id ?? i}
                    i={i + 2}
                    tone={TONES[i % TONES.length]}
                    title={e.role}
                    org={[e.company, e.location].filter(Boolean).join(', ')}
                    when={periodOf(e)}
                    note={e.description}
                    tags={e.tags}
                    current={isCurrent(e)}
                    nowLabel={t.nowLabel}
                  />
                ))}
              </div>
            </Chapter>
          )}

          {education.length > 0 && (
            <Chapter id="education" n={number('education')} title={t.educationHeading} tone="orange">
              <div className={styles.courses}>
                {education.map((e, i) => (
                  <Course
                    key={e.id ?? i}
                    i={i + 2}
                    tone={TONES[(i + 2) % TONES.length]}
                    title={[e.degree, e.field].filter(Boolean).join(', ') || e.institution}
                    org={e.institution}
                    when={periodOf(e) || t.earlierLabel}
                    note={e.description}
                    current={isCurrent(e)}
                    nowLabel={t.nowLabel}
                  />
                ))}
              </div>
            </Chapter>
          )}

          {certifications.length > 0 && (
            <Chapter id="certifications" n={number('certifications')} title={t.certificationsHeading} tone="pink">
              <Credentials items={certifications} labels={badges} detailed />
            </Chapter>
          )}

          {skills.length > 0 && (
            <Chapter id="skills" n={number('skills')} title={t.skillsHeading} tone="yellow" aside={t.skillsHint}>
              <Stack entries={skills} />
            </Chapter>
          )}

          {(interests.length > 0 || languages.length > 0 || photos.length > 0) && (
            <Chapter id="interests" n={number('interests')} title={t.interestsHeading} tone="blue">
              {photos.length > 0 && (
                <>
                  <p className={styles.galleryLede} data-rise style={{ '--i': 2 }}>{tph.bioLede}</p>
                  <Gallery photos={photos} labels={{ close: tph.viewerClose, next: tph.viewerNext, prev: tph.viewerPrev }} />
                </>
              )}
              {interests.length > 0 && (
                <ul className={styles.interests} data-tones>
                  {interests.map((n, i) => (
                    <li key={n} data-rise style={{ '--i': i + 3 }}>
                      <Draggable className={styles.interest}>{n}</Draggable>
                    </li>
                  ))}
                </ul>
              )}
              {languages.length > 0 && (
                <p className={styles.langs} data-rise style={{ '--i': 4 }}>
                  <span className={styles.pillKey}>{t.languagesLabel}</span>
                  {languages.join(', ')}
                </p>
              )}
            </Chapter>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bio;
