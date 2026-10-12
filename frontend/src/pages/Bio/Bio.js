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
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import SocialIcon from '../../components/SocialIcon';
import Drift from '../../components/Drift';
import Credentials, { toCredential, onPath } from '../../components/Credentials';
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

const Entry = ({ when, what, where, note, tags, current }) => (
  <article className={styles.entry}>
    <p className={styles.when}>
      {when ?? 'Earlier'}
      {current && <span className={styles.currentDot} aria-hidden="true" />}
    </p>
    <div className={styles.what}>
      <h3>{what}</h3>
      {where && <p className={styles.where}>{where}</p>}
      {note && <p className={styles.note}>{note}</p>}
      {tags?.length > 0 && (
        <ul className={styles.tags}>
          {tags.map((tag, i) => <li key={i}>{tag}</li>)}
        </ul>
      )}
    </div>
  </article>
);

const Section = ({ id, title, children }) => {
  const [ref, shown] = useReveal({ threshold: 0.04 });
  return (
    <section
      id={id}
      ref={ref}
      className={styles.section}
      data-shown={shown ? '' : undefined}
      style={{ '--step': '60ms' }}
    >
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
};

const Bio = () => {
  const { data, loading } = usePortfolioData();
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
  const name = personal.name ?? 'Francois Meiring';
  const summary = personal.summary || t.lede;

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
          {photo && (
            <div className={styles.portrait} data-rise style={{ '--i': 0 }}>
              <img src={photo} alt="" width="320" height="320" fetchPriority="high" />
            </div>
          )}

          <div className={styles.identityText}>
            <div data-rise style={{ '--i': 0 }}>
              <Chip dot="ink">{t.eyebrow}</Chip>
            </div>
            <h1 className={styles.name}><span className="mask"><span style={{ '--i': 1 }}>{name}</span></span></h1>
            {personal.title && <p className={styles.title} data-rise style={{ '--i': 2 }}>{personal.title}</p>}
          </div>
        </div>

        <dl className={styles.reach} data-rise style={{ '--i': 3 }}>
          {contact.location && (<><dt>based</dt><dd>{contact.location}</dd></>)}
          {contact.email && (<><dt>email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></>)}
          {contact.phone && (<><dt>phone</dt><dd><a href={`tel:${String(contact.phone).replace(/\s+/g, '')}`}>{contact.phone}</a></dd></>)}
          {social.map((s, i) => (
            <div key={s.key ?? i} className={styles.reachRow}>
              <dt className={styles.socialKey}>
                <SocialIcon platform={s.key} url={s.url} className={styles.socialIcon} />
                {(s.platform || s.key || '').toLowerCase()}
              </dt>
              <dd><a href={s.url} target="_blank" rel="noopener noreferrer">{String(s.url).replace(/^https?:\/\/(www\.)?/, '')}</a></dd>
            </div>
          ))}
        </dl>

        <div className={styles.headActions} data-rise data-print-hide style={{ '--i': 4 }}>
          <Button variant="line" size="sm" onClick={() => window.print()}>{t.printLabel}</Button>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.contents} aria-label="On this page" data-print-hide>
          <h5>contents</h5>
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
          {loading && <p className={styles.waiting}>reading the record</p>}

          <Section id="profile" title={t.profileHeading}>
            <p className={styles.summary} data-rise>{summary}</p>
          </Section>

          {experience.length > 0 && (
            <Section id="experience" title={t.experienceHeading}>
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-rise style={{ '--i': i }}>
                  <Entry
                    when={periodOf(e)}
                    what={e.role}
                    where={e.company}
                    note={e.description}
                    tags={e.tags}
                    current={isCurrent(e)}
                  />
                </div>
              ))}
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" title={t.educationHeading}>
              {education.map((e, i) => (
                <div key={e.id ?? i} data-rise style={{ '--i': i }}>
                  <Entry
                    when={periodOf(e)}
                    what={[e.degree, e.field].filter(Boolean).join(', ')}
                    where={e.institution}
                    note={e.description}
                    current={isCurrent(e)}
                  />
                </div>
              ))}
            </Section>
          )}

          {certifications.length > 0 && (
            <Section id="certifications" title={t.certificationsHeading}>
              <Credentials items={pathCerts} labels={badges} detailed />

              {otherCerts.length > 0 && (
                <div className={pathCerts.length > 0 ? styles.otherCerts : undefined}>
                  {pathCerts.length > 0 && <h3 className={styles.subTitle}>{t.otherCertificationsHeading}</h3>}
                  {otherCerts.map((raw, i) => {
                    const c = toCredential(raw);
                    return (
                      <div key={c.id ?? i} data-rise style={{ '--i': i }}>
                        <Entry
                          when={[
                            c.issued,
                            c.expires && (/expire/i.test(c.expires) ? c.expires : `${badges.expiresLabel} ${c.expires}`),
                          ].filter(Boolean).join(', ')}
                          what={c.name}
                          where={c.issuer}
                          note={c.note}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {skills.length > 0 && (
            <Section id="skills" title={t.skillsHeading}>
              <Stack entries={skills} />
            </Section>
          )}

          {(interests.length > 0 || languages.length > 0) && (
            <Section id="interests" title={t.interestsHeading}>
              <ul className={styles.chips}>
                {interests.map(name => <li key={name}><Chip>{name}</Chip></li>)}
              </ul>
              {languages.length > 0 && (
                <p className={styles.langs}>
                  <span className="label">{t.languagesLabel}</span>
                  {languages.join(', ')}
                </p>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bio;
