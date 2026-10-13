import { useMemo } from 'react';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import useActiveSection from '../../hooks/useActiveSection';
import { scrollPageTo } from '../../hooks';
import { resolveGroup } from '../../content/copy/resolve';
import { BIO_FIELDS } from '../../content/copy/bio';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { periodOf, isCurrent } from '../../content/records';
import Stack from '../../components/Stack';
import Skeleton, { Bone } from '../../components/Skeleton';
import { useToast } from '../../components';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import SocialIcon from '../../components/SocialIcon';
import Drift from '../../components/Drift';
import Credentials, { toCredential, onPath } from '../../components/Credentials';
import PrintCV from './PrintCV';
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

const Job = ({ title, org, when, note, tags, current, tone, i }) => (
  <article className={styles.job} style={{ '--tone': `var(--c-${tone})`, '--i': i }} data-rise>
    <span className={styles.node} aria-hidden="true" />
    <header className={styles.jobHead}>
      <div className={styles.jobTitle}>
        <h3>{title}</h3>
        {org && <p className={styles.org}>{org}</p>}
      </div>
      {when && (
        <p className={styles.period}>
          {current && <span className={styles.now}>now</span>}
          {when}
        </p>
      )}
    </header>
    {note && <p className={styles.note}>{note}</p>}
    {tags?.length > 0 && (
      <ul className={styles.tags}>
        {tags.map((tag, k) => <li key={k}>{tag}</li>)}
      </ul>
    )}
  </article>
);

const Card = ({ title, org, when, note, current, tone, i }) => (
  <article className={styles.card} style={{ '--tone': `var(--c-${tone})`, '--i': i }} data-rise>
    <p className={styles.cardWhen}>
      {current && <span className={styles.now}>now</span>}
      {when || 'Earlier'}
    </p>
    <h3>{title}</h3>
    {org && <p className={styles.org}>{org}</p>}
    {note && <p className={styles.cardNote}>{note}</p>}
  </article>
);

// The shape of the record while it loads: a profile paragraph and two job cards.
const RecordSkeleton = () => (
  <Skeleton label="Loading the CV">
    <div className={styles.section}>
      <Bone w="11rem" h="2.6rem" style={{ marginBottom: '1.75rem' }} />
      {[100, 96, 98, 60].map((w, i) => <Bone key={i} w={`${w}%`} h="1rem" style={{ marginBottom: '0.75rem' }} />)}
    </div>
    <div className={styles.section}>
      <Bone w="14rem" h="2.6rem" style={{ marginBottom: '1.75rem' }} />
      <div className={styles.timeline}>
        {[0, 1].map(i => (
          <div key={i} className={styles.job}>
            <Bone w="45%" h="1.4rem" />
            <Bone w="30%" h="0.9rem" style={{ marginTop: '0.6rem' }} />
            <Bone w="100%" h="0.85rem" style={{ marginTop: '1.2rem' }} />
            <Bone w="85%" h="0.85rem" style={{ marginTop: '0.5rem' }} />
          </div>
        ))}
      </div>
    </div>
  </Skeleton>
);

const Section = ({ id, title, tone, children }) => {
  const [ref, shown] = useReveal({ threshold: 0.04 });
  return (
    <section
      id={id}
      ref={ref}
      className={styles.section}
      data-shown={shown ? '' : undefined}
      style={{ '--step': '70ms' }}
    >
      <Headline as="h2" text={`*${title}*`} tone={tone} className={styles.sectionTitle} />
      {children}
    </section>
  );
};

const Bio = () => {
  const { data, loading } = usePortfolioData();
  const { toast } = useToast();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(BIO_FIELDS, overrides.bio);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const experience = data?.experience ?? [];
  const education = data?.education ?? [];
  const certifications = data?.certifications ?? [];
  const pathCerts = certifications.filter(onPath);
  const otherCerts = certifications
    .filter(c => !onPath(c))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  const skills = useMemo(() => flattenSkills(data?.skills), [data]);

  const interests = useMemo(() => {
    const raw = data?.interests;
    return (Array.isArray(raw) ? raw : raw?.items ?? []).map(itemLabel).filter(Boolean);
  }, [data]);

  const languages = useMemo(
    () => (personal.languages ?? []).map(itemLabel).filter(Boolean),
    [personal],
  );

  const github = social.find(s => (s.key || '').toLowerCase() === 'github');
  const user = github?.url ? github.url.replace(/\/$/, '').split('/').pop() : null;
  const photo = personal.photoUrl || (user ? `https://github.com/${user}.png` : null);
  const name = personal.name ?? '';
  const summary = personal.summary || t.lede;

  // Only print a complete record. A half-loaded CV is worse than none.
  const printCv = () => {
    if (data?.failed?.length) {
      toast.error(`${t.cvIncomplete} (${data.failed.join(', ')})`);
      return;
    }
    window.print();
  };

  const contents = [
    { id: 'profile', label: t.profileHeading },
    experience.length > 0 && { id: 'experience', label: t.experienceHeading },
    education.length > 0 && { id: 'education', label: t.educationHeading },
    certifications.length > 0 && { id: 'certifications', label: t.certificationsHeading },
    skills.length > 0 && { id: 'skills', label: t.skillsHeading },
    (interests.length > 0 || languages.length > 0) && { id: 'interests', label: t.interestsHeading },
  ].filter(Boolean);

  const [headRef, headShown] = useReveal({ threshold: 0 });
  const ids = useMemo(() => contents.map(c => c.id), [contents.map(c => c.id).join('|')]);
  const active = useActiveSection(ids);

  return (
    <div className={styles.page}>
      <Drift shapes={[
        { kind: 'circle', colour: 'blue', x: '100%', y: '150px', size: 'clamp(180px, 22vw, 320px)', speed: 0.6, spin: 25, wide: true },
      ]} />

      <header
        ref={headRef}
        className={styles.head}
        data-shown={headShown ? '' : undefined}
        style={{ '--step': '70ms' }}
      >
        <div className={styles.identity}>
          {loading ? (
            <div className={styles.portrait}><Bone h="100%" r="0" /></div>
          ) : photo && (
            <div className={styles.portrait} data-rise style={{ '--i': 0 }}>
              <img src={photo} alt="" width="320" height="320" fetchPriority="high" />
            </div>
          )}
          <div className={styles.identityText}>
            <div data-rise style={{ '--i': 0 }}>
              <Chip dot="ink">{t.eyebrow}</Chip>
            </div>
            {loading ? (
              <>
                <Bone w="min(26rem, 80%)" h="3.6rem" />
                <Bone w="14rem" h="1.3rem" />
              </>
            ) : (
              <>
                <h1 className={styles.name}><span className="mask"><span style={{ '--i': 1 }}>{name}</span></span></h1>
                {personal.title && <p className={styles.title} data-rise style={{ '--i': 2 }}>{personal.title}</p>}
              </>
            )}
            <div className={styles.headActions} data-rise data-print-hide style={{ '--i': 3 }}>
              <Button variant="line" size="sm" disabled={loading || !data} onClick={printCv}>{t.printLabel}</Button>
            </div>
          </div>
        </div>

        <ul className={styles.contact} data-rise style={{ '--i': 3 }}>
          {loading && [0, 1, 2].map(i => (
            <li key={i}><Bone w="3.5rem" h="0.8rem" /><Bone w={['80%', '90%', '60%'][i]} h="1rem" /></li>
          ))}
          {contact.location && (
            <li><span className={styles.cKey}>Based</span><span className={styles.cVal}>{contact.location}</span></li>
          )}
          {contact.email && (
            <li><span className={styles.cKey}>Email</span><a className={styles.cVal} href={`mailto:${contact.email}`}>{contact.email}</a></li>
          )}
          {contact.phone && (
            <li><span className={styles.cKey}>Phone</span><a className={styles.cVal} href={`tel:${String(contact.phone).split(' ').join('')}`}>{contact.phone}</a></li>
          )}
          {social.length > 0 && (
            <li className={styles.cSocial} data-tones>
              {social.map((s, i) => (
                <a
                  key={s.key ?? i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cIcon}
                  aria-label={s.platform || s.key}
                  title={s.platform || s.key}
                >
                  <SocialIcon platform={s.key} url={s.url} />
                </a>
              ))}
            </li>
          )}
        </ul>
      </header>

      <div className={styles.body}>
        <nav className={styles.contents} aria-label="On this page" data-print-hide>
          <h5>On this page</h5>
          {contents.map(c => (
            <a
              key={c.id}
              href={`#${c.id}`}
              onClick={(e) => {
                const target = document.getElementById(c.id);
                if (!target) return;
                e.preventDefault();
                scrollPageTo(target, { offset: -96 });
              }}
              className={styles.contentsLink}
              data-current={c.id === active ? '' : undefined}
              aria-current={c.id === active ? 'true' : undefined}
            >
              <span className={styles.tick} aria-hidden="true" />
              {c.label}
            </a>
          ))}
        </nav>

        <div className={styles.record}>
          {loading ? <RecordSkeleton /> : (
            <Section id="profile" title={t.profileHeading} tone="blue">
              <p className={styles.summary} data-rise>{summary}</p>
            </Section>
          )}

          {experience.length > 0 && (
            <Section id="experience" title={t.experienceHeading} tone="green">
              <div className={styles.timeline}>
                {experience.map((e, i) => (
                  <Job
                    key={e.id ?? i}
                    i={i}
                    tone={TONES[i % TONES.length]}
                    title={e.role}
                    org={[e.company, e.location].filter(Boolean).join(', ')}
                    when={periodOf(e)}
                    note={e.description}
                    tags={e.tags}
                    current={isCurrent(e)}
                  />
                ))}
              </div>
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" title={t.educationHeading} tone="orange">
              <div className={styles.cards}>
                {education.map((e, i) => (
                  <Card
                    key={e.id ?? i}
                    i={i}
                    tone={TONES[(i + 2) % TONES.length]}
                    title={[e.degree, e.field].filter(Boolean).join(', ')}
                    org={e.institution}
                    when={periodOf(e)}
                    note={e.description}
                    current={isCurrent(e)}
                  />
                ))}
              </div>
            </Section>
          )}

          {certifications.length > 0 && (
            <Section id="certifications" title={t.certificationsHeading} tone="pink">
              <Credentials items={pathCerts} labels={badges} detailed />

              {otherCerts.length > 0 && (
                <>
                  {pathCerts.length > 0 && <h3 className={styles.subTitle}>{t.otherCertificationsHeading}</h3>}
                  <div className={styles.cards}>
                    {otherCerts.map((raw, i) => {
                      const c = toCredential(raw);
                      return (
                        <Card
                          key={c.id ?? i}
                          i={i}
                          tone={TONES[(i + 3) % TONES.length]}
                          title={c.name}
                          org={c.issuer}
                          when={[
                            c.issued,
                            c.expires && (/expire/i.test(c.expires) ? c.expires : `${badges.expiresLabel} ${c.expires}`),
                          ].filter(Boolean).join(', ')}
                          note={c.note}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </Section>
          )}

          {skills.length > 0 && (
            <Section id="skills" title={t.skillsHeading} tone="yellow">
              <Stack entries={skills} />
            </Section>
          )}

          {(interests.length > 0 || languages.length > 0) && (
            <Section id="interests" title={t.interestsHeading} tone="blue">
              <ul className={styles.chips}>
                {interests.map(n => <li key={n}><Chip>{n}</Chip></li>)}
              </ul>
              {languages.length > 0 && (
                <p className={styles.langs}>
                  <span className={styles.cKey}>{t.languagesLabel}</span>
                  {languages.join(', ')}
                </p>
              )}
            </Section>
          )}
        </div>
      </div>

      <PrintCV
        name={name}
        photo={photo}
        personal={personal}
        contact={contact}
        social={social}
        experience={experience}
        education={education}
        certifications={certifications}
        skills={skills}
        skillGroups={data?.skills?.categories ?? []}
        interests={interests}
        languages={languages}
        summary={personal.summary ?? ''}
        t={t}
        badges={badges}
      />
    </div>
  );
};

export default Bio;
