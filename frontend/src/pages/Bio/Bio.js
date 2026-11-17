import { useMemo } from 'react';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useCvDownload from '../../hooks/useCvDownload';
import { resolveGroup } from '../../content/copy/resolve';
import { githubAvatar } from '../../content/avatar';
import { BIO_FIELDS } from '../../content/copy/bio';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { PHOTOS_FIELDS } from '../../content/copy/photos';
import { periodOf, isCurrent } from '../../content/records';
import Skeleton, { Bone } from '../../components/Skeleton';
import Button from '../../components/Button';
import Headline from '../../components/Headline';
import Draggable from '../../components/Draggable';
import SocialIcon from '../../components/SocialIcon';
import Credentials from '../../components/Credentials';
import Stack from '../../components/Stack';
import Gallery from '../../components/Gallery';
import Chapter from './Chapter';
import Rail from '../../components/Rail';
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

// The record while it loads: a paragraph in the sidebar, two cards beside it.
const RecordSkeleton = ({ label }) => (
  <Skeleton label={label} className={styles.columns}>
    <div className={styles.wait}>
      <Bone w="8rem" h="2rem" />
      {[100, 96, 98, 60].map((w, i) => <Bone key={i} w={`${w}%`} h="1rem" />)}
    </div>
    <div className={styles.wait}>
      {[0, 1].map(i => <Bone key={i} h="11rem" r="var(--r-card)" />)}
    </div>
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

  const outside = interests.length > 0 || languages.length > 0 || photos.length > 0;

  return (
    <div className={styles.page}>
      {/* The CV's own header: one wide slab with the stripe under it */}
      <header className={`panel stripe ${styles.mast}`} style={{ '--step': '70ms' }}>
        <div className={styles.portrait} data-rise style={{ '--i': 0 }}>
          {loading ? <Bone w="100%" h="100%" r="0" /> : photo && (
            <img src={photo} alt={name} width="480" height="480" fetchPriority="high" />
          )}
        </div>

        <div className={styles.who}>
          <p className={styles.eyebrow} data-rise style={{ '--i': 1 }}>{t.eyebrow}</p>
          {loading ? (
            <>
              <Bone w="min(26rem, 80%)" h="4rem" />
              <Bone w="14rem" h="1.3rem" />
            </>
          ) : (
            <>
              <h1 className={styles.name} data-reveal>
                {name.split(' ').map((w, i) => (
                  <span key={i} className="mask"><span style={{ '--i': i + 1 }}>{w}</span></span>
                )).reduce((a, b, i) => (i ? [...a, ' ', b] : [b]), [])}
              </h1>
              {personal.title && <p className={styles.role} data-rise style={{ '--i': 3 }}>{personal.title}</p>}
            </>
          )}
        </div>

        <div className={styles.actions} data-rise data-print-hide style={{ '--i': 4 }}>
          <Button
            variant="primary"
            tone="yellow"
            size="lg"
            icon={<DownloadIcon />}
            status={cv.status}
            disabled={loading || !data}
            onClick={() => cv.run()}
          >
            {t.printLabel}
          </Button>
        </div>

        <div className={styles.facts} data-rise style={{ '--i': 5 }}>
          <ul className={styles.contact}>
            {loading && [0, 1].map(i => <li key={i}><Bone w="12rem" h="2.6rem" r="var(--r-control)" /></li>)}
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
          {social.length > 0 && (
            <div className={styles.social} data-print-hide data-tones>
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
      </header>

      {/* The profile reads across: its title on the left, the words on the right */}
      {!loading && (
        <section id="profile" className={styles.profile}>
          <Headline as="h2" text={`*${t.profileHeading}*`} tone="blue" className={styles.profileTitle} start={1} />
          <p className={styles.summary} data-rise style={{ '--i': 2 }}>{summary}</p>
        </section>
      )}

      {/* Two columns like the printed CV: what he studied beside where he has worked */}
      {loading ? <RecordSkeleton label={a11y.loadingCv} /> : (
        <div className={styles.columns}>
          <div className={styles.aside}>
            {education.length > 0 && (
              <Chapter id="education" title={t.educationHeading} tone="orange">
                <ul className={`panel ${styles.ledger}`}>
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
                </ul>
              </Chapter>
            )}

            {certifications.length > 0 && (
              <Chapter id="certifications" title={t.certificationsHeading} tone="pink">
                <Credentials items={certifications} labels={badges} detailed />
              </Chapter>
            )}
          </div>

          <div className={styles.main}>
            {experience.length > 0 && (
              <Chapter id="experience" title={t.experienceHeading} tone="green">
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
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <Chapter id="skills" title={t.skillsHeading} tone="yellow" aside={t.skillsHint}>
          <Stack entries={skills} />
        </Chapter>
      )}

      {outside && (
        <Chapter id="interests" title={t.interestsHeading} tone="blue">
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
  );
};

export default Bio;
