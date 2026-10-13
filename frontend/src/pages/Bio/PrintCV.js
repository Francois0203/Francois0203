import { periodOf, isCurrent, startKey } from '../../content/records';
import { platformFor } from '../../components/SocialIcon';
import { toCredential, onPath } from '../../components/Credentials';
import styles from './PrintCV.module.css';

// "https://www.github.com/name/" -> "github.com/name", allowed to wrap after each slash.
const shortUrl = (url = '') => url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '')
  .split('/').flatMap((part, i) => (i ? ['/', <wbr key={i} />, part] : [part]));

// "January 2025 - April 2026" -> "Jan 2025 - Apr 2026"
const shortDates = (text = '') => String(text ?? '').replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/g, '$1');

// Drops street addresses: "39 Main Road, Melrose Arch, Johannesburg" -> "Melrose Arch, Johannesburg"
const area = (location = '') => String(location ?? '').split(',').map(s => s.trim()).filter(s => s && !/\d/.test(s)).slice(-2).join(', ');

// Newest first: current roles on top, then by end date, then by start date.
const newestFirst = (list) => [...list].sort((a, b) => {
  const end = (r) => (isCurrent(r) ? Infinity : startKey({ start: r.end }) ?? startKey(r) ?? -Infinity);
  return end(b) - end(a) || (startKey(b) ?? 0) - (startKey(a) ?? 0);
});

const Section = ({ title, tone, children }) => (
  <section className={styles.section} style={{ '--tone': `var(--c-${tone})`, '--tone-deep': `var(--c-${tone}-deep)` }}>
    <h2 className={styles.heading}>{title}</h2>
    {children}
  </section>
);

// A plain, compact A4 CV. Only visible when printing.
// Anything marked showOnCv: false in Firebase stays on the website but off the CV.
const onCv = (r) => r?.showOnCv !== false;

const PrintCV = ({ name, photo, personal, contact, social: allSocial, experience: allExperience, education: allEducation, certifications: allCerts, skills: allSkills, skillGroups, interests: allInterests, languages: allLanguages, summary, t, badges }) => {
  const experience = allExperience.filter(onCv);
  const education = allEducation.filter(onCv);
  const certifications = allCerts.filter(onCv);
  const social = allSocial.filter(onCv);
  const hiddenGroups = new Set(skillGroups.filter(g => !onCv(g)).map(g => g.name));
  const skills = allSkills.filter(s => !hiddenGroups.has(s.group));
  const interests = personal.cvInterests === false ? [] : allInterests;
  const languages = personal.cvLanguages === false ? [] : allLanguages;
  const portrait = personal.cvPhoto === false ? null : photo;

  const groups = [];
  skills.forEach(({ label, group }) => {
    const key = group || '';
    let g = groups.find(x => x.name === key);
    if (!g) groups.push(g = { name: key, items: [] });
    if (!g.items.includes(label)) g.items.push(label);
  });

  const certs = certifications.map(c => ({ ...toCredential(c), path: onPath(c) }))
    .filter(c => c.status !== 'planned' && c.name)
    .sort((a, b) => (a.status === 'earned' ? 0 : 1) - (b.status === 'earned' ? 0 : 1) || a.order - b.order);

  const updated = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date());

  // Pages 2 onwards carry the name and page number, in case the pages get separated.
  const css = (text) => JSON.stringify(String(text ?? ''));
  const pageRules = `@media print {
    @page {
      @bottom-left { content: ${css(name)}; font: 7.5pt 'Onest Variable', sans-serif; color: #6b6b75; }
      @bottom-right { content: ${css(`${t.cvPage} `)} counter(page) ${css(` ${t.cvOf} `)} counter(pages); font: 7.5pt 'Onest Variable', sans-serif; color: #6b6b75; }
    }
    @page :first {
      margin-bottom: 11mm;
      @bottom-left { content: none; }
      @bottom-right { content: none; }
    }
  }`;

  return (
    <article className={styles.cv} data-print-only aria-hidden="true">
      <style>{pageRules}</style>
      <header className={styles.head}>
        <div className={styles.who}>
          {portrait && <img className={styles.photo} src={portrait} alt="" />}
          <div>
            <h1 className={styles.name}>{name}</h1>
            {personal.title && <p className={styles.title}>{personal.title}</p>}
          </div>
        </div>
        <ul className={styles.contact}>
          {contact.email && <li>{contact.email}</li>}
          {contact.phone && <li>{contact.phone}</li>}
          {contact.location && <li>{contact.location}</li>}
          <li className={styles.updated}>{t.cvUpdated} {updated}</li>
        </ul>
      </header>

      <div className={styles.body}>
        <div className={styles.main}>
          {summary && (
            <Section title={t.profileHeading} tone="blue">
              <p className={styles.summary}>{summary}</p>
            </Section>
          )}

          {experience.length > 0 && (
            <Section title={t.experienceHeading} tone="green">
              {newestFirst(experience).map((e, i) => (
                <div key={e.id ?? i} className={styles.entry}>
                  <div className={styles.entryHead}>
                    <h3>{e.role}</h3>
                    <span className={styles.when}>{shortDates(periodOf(e))}</span>
                  </div>
                  <p className={styles.org}>{[e.company, area(e.location)].filter(Boolean).join(', ')}</p>
                  {e.description && <p className={styles.text}>{e.description}</p>}
                  {e.tags?.length > 0 && <p className={styles.tags}>{e.tags.join(' · ')}</p>}
                </div>
              ))}
            </Section>
          )}

          {education.length > 0 && (
            <Section title={t.educationHeading} tone="orange">
              {newestFirst(education).map((e, i) => (
                <div key={e.id ?? i} className={styles.entry}>
                  <div className={styles.entryHead}>
                    <h3>{[e.degree, e.field].filter(Boolean).join(', ') || e.institution}</h3>
                    <span className={styles.when}>{shortDates(periodOf(e))}</span>
                  </div>
                  {e.institution && <p className={styles.org}>{e.institution}</p>}
                  {e.description && <p className={styles.text}>{e.description}</p>}
                </div>
              ))}
            </Section>
          )}
        </div>

        <aside className={styles.side}>
          {groups.length > 0 && (
            <Section title={t.skillsHeading} tone="yellow">
              {groups.map(g => (
                <div key={g.name} className={styles.group}>
                  {g.name && <h3>{g.name}</h3>}
                  <p>{g.items.join(', ')}</p>
                </div>
              ))}
            </Section>
          )}

          {certs.length > 0 && (
            <Section title={t.certificationsHeading} tone="pink">
              {certs.map((c, i) => (
                <div key={c.id ?? i} className={styles.cert}>
                  <h3>{c.name}</h3>
                  <p>
                    {c.status === 'earned'
                      ? <>{c.issuer}{c.issuer && c.issued && ', '}<span className={styles.date}>{shortDates(c.issued)}</span></>
                      : [t.cvInProgress, c.status === 'booked' && c.examDate && `${badges.statusBooked} ${c.examDate}`].filter(Boolean).join(', ')}
                  </p>
                </div>
              ))}
            </Section>
          )}

          {social.length > 0 && (
            <Section title={t.cvProfilesHeading} tone="blue">
              <ul className={styles.links}>
                {social.map((s, i) => {
                  const p = platformFor(s.key, s.url);
                  return (
                    <li key={s.key ?? i}>
                      <span>{p.key === 'website' ? (s.platform || s.key) : p.label}</span>
                      {shortUrl(s.url)}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {languages.length > 0 && (
            <Section title={t.cvLanguagesHeading} tone="green">
              <p className={styles.plain}>{languages.join(', ')}</p>
            </Section>
          )}

          {interests.length > 0 && (
            <Section title={t.cvInterestsHeading} tone="orange">
              <p className={styles.plain}>{interests.join(', ')}</p>
            </Section>
          )}
        </aside>
      </div>
    </article>
  );
};

export default PrintCV;
