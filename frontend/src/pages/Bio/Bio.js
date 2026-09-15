import { useMemo } from 'react';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import useActiveSection from '../../hooks/useActiveSection';
import { scrollPageTo } from '../../hooks';
import { resolveGroup } from '../../content/copy/resolve';
import { BIO_FIELDS } from '../../content/copy/bio';
import Stack from '../../components/Stack';
import styles from './Bio.module.css';

/*
 * The record, in full. Laid out as a document: a contents column that
 * stays with the reader, entries running beside it.
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

const period = (e) =>
  e.period || e.dates || (e.start ? `${e.start}${e.end ? `, ${e.end}` : ', present'}` : null);

const Entry = ({ when, what, where, note, tags }) => (
  <article className={styles.entry}>
    <p className={styles.when}>{when ?? 'Earlier'}</p>
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
      {children}
    </section>
  );
};

const Bio = () => {
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(BIO_FIELDS, overrides.bio);

  const personal = data?.personal ?? {};
  const experience = data?.experience ?? [];
  const education = data?.education ?? [];
  const certifications = data?.certifications ?? [];

  const skills = useMemo(() => flattenSkills(data?.skills), [data]);

  const interests = useMemo(() => {
    const raw = data?.interests;
    return (Array.isArray(raw) ? raw : raw?.items ?? []).map(itemLabel).filter(Boolean);
  }, [data]);

  const languages = useMemo(
    () => (personal.languages ?? []).map(itemLabel).filter(Boolean),
    [personal],
  );

  // Only sections with content, so no link points at an empty anchor.
  const contents = [
    experience.length > 0 && { id: 'experience', label: t.experienceHeading },
    education.length > 0 && { id: 'education', label: t.educationHeading },
    certifications.length > 0 && { id: 'certifications', label: t.certificationsHeading },
    skills.length > 0 && { id: 'skills', label: t.skillsHeading },
    (interests.length > 0 || languages.length > 0) && { id: 'interests', label: t.interestsHeading },
  ].filter(Boolean);

  const [headRef, headShown] = useReveal({ threshold: 0 });

  /* Memoised on the joined ids: a new array identity every render would
     restart the observer each time. */
  const ids = useMemo(() => contents.map(c => c.id), [contents.map(c => c.id).join('|')]);
  const active = useActiveSection(ids);

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
        <p className={styles.lede} data-rise style={{ '--i': 2 }}>{personal.bio || personal.summary || t.lede}</p>
      </header>

      <div className={styles.body}>
        <nav className={styles.contents} aria-label="On this page">
          <h5>Contents</h5>
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
          {loading && <p className={styles.waiting}>Reading the record</p>}

          {experience.length > 0 && (
            <Section id="experience" title={t.experienceHeading}>
              {experience.map((e, i) => (
                <div key={e.id ?? i} data-rise style={{ '--i': i }}>
                  <Entry
                    when={period(e)}
                    what={e.role || e.position || e.title}
                    where={e.company || e.employer || e.organisation}
                    note={e.description || e.summary}
                    tags={e.tech || e.technologies || e.stack || e.tags}
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
                    when={period(e)}
                    what={[e.degree || e.qualification, e.field || e.major].filter(Boolean).join(', ')}
                    where={e.institution || e.school || e.university}
                    note={e.description || e.summary}
                  />
                </div>
              ))}
            </Section>
          )}

          {certifications.length > 0 && (
            <Section id="certifications" title={t.certificationsHeading}>
              {certifications.map((c, i) => (
                <div key={c.id ?? i} data-rise style={{ '--i': i }}>
                  <Entry
                    when={period(c)}
                    what={c.name || c.title}
                    where={c.issuer || c.organisation}
                    note={c.description}
                  />
                </div>
              ))}
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
                {interests.map(name => <li key={name}>{name}</li>)}
                {languages.length > 0 && (
                  <li className={styles.langs}>{languages.join(', ')}</li>
                )}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bio;
