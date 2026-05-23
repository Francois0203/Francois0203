import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { MdArrowOutward } from 'react-icons/md';
import usePortfolioData from '../../hooks/usePortfolioData';
import styles from './Bio.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toSkillGroups = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills.categories)) return skills.categories;
  if (Array.isArray(skills.items))      return [{ name: null, items: skills.items }];
  return Object.entries(skills)
    .filter(([, v]) => Array.isArray(v) && v.length)
    .map(([name, items]) => ({ name, items }));
};

const itemLabel = (s) => (typeof s === 'string' ? s : s?.name ?? s?.title ?? String(s));

const period = (e) =>
  e.period || e.dates ||
  (e.start ? `${e.start}${e.end ? ` – ${e.end}` : ' – Present'}` : null);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skel = ({ w, h = '0.85rem' }) => (
  <span className={styles.skel} style={{ width: w, height: h }} />
);

const SkelEntry = () => (
  <div className={styles.entry}>
    <div className={styles.entryDot} aria-hidden="true" />
    <div className={styles.entryBody}>
      <div className={styles.entryTop}>
        <Skel w="42%" h="1rem" />
        <Skel w="80px" />
      </div>
      <Skel w="32%" />
      <Skel w="90%" />
      <Skel w="65%" />
    </div>
  </div>
);

// ─── Timeline entry ───────────────────────────────────────────────────────────

const TimelineEntry = ({ title, subtitle, p, current, description, tags }) => (
  <div className={styles.entry}>
    <div className={styles.entryDot} aria-hidden="true" />
    <div className={styles.entryBody}>
      <div className={styles.entryTop}>
        <div className={styles.entryTitleRow}>
          <span className={styles.entryTitle}>{title}</span>
          {current && <span className={styles.presentBadge}>Present</span>}
        </div>
        {p && <span className={styles.entryPeriod}>{p}</span>}
      </div>
      {subtitle && <p className={styles.entryRole}>{subtitle}</p>}
      {description && <p className={styles.entryDesc}>{description}</p>}
      {tags?.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
        </div>
      )}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const Bio = () => {
  const { data, loading, error } = usePortfolioData();
  const navigate = useNavigate();

  const personal   = data?.personal   ?? {};
  const contact    = data?.contact    ?? {};
  const skills     = toSkillGroups(data?.skills);
  const interests  = data?.interests  ?? [];
  const experience = data?.experience ?? [];
  const education  = data?.education  ?? [];
  const social     = data?.social     ?? [];

  const email    = personal.email    || contact.email;
  const phone    = personal.phone    || contact.phone;
  const location = personal.location || contact.location;
  const linkedin  = social.find(s => (s.key || '').toLowerCase() === 'linkedin');
  const github    = social.find(s => (s.key || '').toLowerCase() === 'github');
  const cvUrl     = personal.cvUrl;

  const githubUser = github?.url
    ? github.url.replace(/\/$/, '').split('/').pop()
    : null;
  const photoUrl = personal.photoUrl || (githubUser ? `https://github.com/${githubUser}.png` : null);

  if (!loading && error) {
    return (
      <section className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <p>Could not load portfolio data. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.container}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className={styles.header}>
          <p className={styles.chapterEyebrow}>
            <span className={styles.chapterMark}>Chapter I</span>
            <span className={styles.chapterDash} aria-hidden="true">—</span>
            <span className={styles.chapterName}>The Storyteller</span>
          </p>
          <div className={styles.headerInner}>

            {/* Profile photo */}
            {(loading || photoUrl) && (
              <div className={styles.photoWrap}>
                {loading
                  ? <span className={`${styles.skel} ${styles.photoSkel}`} />
                  : <img
                      src={photoUrl}
                      alt={personal.name ?? 'Profile'}
                      className={styles.photo}
                    />
                }
              </div>
            )}

            <div className={styles.headerMain}>
              {loading ? (
                <>
                  <Skel w="240px" h="2.4rem" />
                  <Skel w="200px" h="1.1rem" />
                </>
              ) : (
                <>
                  <h1 className={styles.name}>{personal.name ?? 'Bio'}</h1>
                  {personal.title && <p className={styles.titleLine}>{personal.title}</p>}
                </>
              )}
            </div>

          </div>

          <div className={styles.contactRow}>
            {loading ? (
              <><Skel w="120px" /><Skel w="160px" /></>
            ) : (
              <>
                {location && (
                  <span className={styles.contactItem}>
                    <FaMapMarkerAlt aria-hidden="true" />
                    {location}
                  </span>
                )}
                {email && (
                  <a href={`mailto:${email}`} className={styles.contactItem}>
                    <FaEnvelope aria-hidden="true" />
                    {email}
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className={styles.contactItem}>
                    <FaPhone aria-hidden="true" />
                    {phone}
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactItem}
                  >
                    LinkedIn
                    <MdArrowOutward aria-hidden="true" />
                  </a>
                )}
                {cvUrl && (
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.contactItem} ${styles.cvLink}`}
                  >
                    Download CV
                    <MdArrowOutward aria-hidden="true" />
                  </a>
                )}
              </>
            )}
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className={styles.content}>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <aside className={styles.sidebar}>

            {/* About */}
            <div className={styles.card}>
              <h2 className={styles.cardLabel}>About</h2>
              {loading ? (
                <div className={styles.skelStack}>
                  <Skel w="100%" /><Skel w="88%" /><Skel w="75%" /><Skel w="93%" />
                </div>
              ) : (() => {
                  const text = personal.bio ?? personal.summary ?? '—';
                  if (!text || text.length < 2) return <p className={styles.bio}>{text}</p>;
                  const [first, ...rest] = text;
                  return (
                    <p className={styles.bio}>
                      <span className={styles.bioDropcap}>{first}</span>
                      {rest.join('')}
                    </p>
                  );
                })()
              }
            </div>

            {/* Skills */}
            {(loading || skills.length > 0) && (
              <div className={styles.card}>
                <h2 className={styles.cardLabel}>Skills</h2>
                {loading ? (
                  <div className={styles.chipRow}>
                    {[72, 56, 88, 64, 80, 50].map(w => (
                      <Skel key={w} w={w} h="1.6rem" />
                    ))}
                  </div>
                ) : (
                  skills.map(({ name, items }) => (
                    <div key={name ?? '_skills'} className={styles.skillGroup}>
                      {name && <p className={styles.skillGroupLabel}>{name}</p>}
                      <div className={styles.chipRow}>
                        {(items ?? []).map((s, i) => (
                          <span key={i} className={styles.chip}>{itemLabel(s)}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Interests */}
            {(loading || interests.length > 0) && (
              <div className={styles.card}>
                <h2 className={styles.cardLabel}>Interests</h2>
                {loading ? (
                  <div className={styles.chipRow}>
                    {[96, 80, 68, 88].map(w => <Skel key={w} w={w} h="1.6rem" />)}
                  </div>
                ) : (
                  <div className={styles.chipRow}>
                    {interests.map((item, i) => (
                      <span key={i} className={styles.interestChip}>{itemLabel(item)}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </aside>

          {/* ── Main ──────────────────────────────────────────────────────── */}
          <main className={styles.main}>

            {/* Experience */}
            <div className={styles.section}>
              <h2 className={styles.sectionHeading}>Experience</h2>
              <div className={styles.timeline}>
                {loading
                  ? [0, 1].map(i => <SkelEntry key={i} />)
                  : experience.length === 0
                    ? <p className={styles.empty}>No experience listed.</p>
                    : experience.map(e => (
                        <TimelineEntry
                          key={e.id}
                          title={e.company || e.employer || e.organisation}
                          subtitle={e.role || e.position || e.title}
                          p={period(e)}
                          current={e.current}
                          description={e.description || e.summary}
                          tags={e.tech || e.technologies || e.stack || e.tags}
                        />
                      ))
                }
              </div>
            </div>

            {/* Education */}
            <div className={styles.section}>
              <h2 className={styles.sectionHeading}>Education</h2>
              <div className={styles.timeline}>
                {loading
                  ? [0, 1].map(i => <SkelEntry key={i} />)
                  : education.length === 0
                    ? <p className={styles.empty}>No education listed.</p>
                    : education.map(e => (
                        <TimelineEntry
                          key={e.id}
                          title={e.institution || e.school || e.university}
                          subtitle={
                            [e.degree || e.qualification, e.field || e.major]
                              .filter(Boolean)
                              .join(' — ') || null
                          }
                          p={period(e)}
                          description={e.description || e.summary}
                          tags={e.tags}
                        />
                      ))
                }
              </div>
            </div>

          </main>
        </div>

        {/* ── Next chapter ─────────────────────────────────────────────── */}
        <footer className={styles.nextChapter}>
          <span className={styles.nextChapterLabel}>Turn the page</span>
          <button
            type="button"
            className={styles.nextChapterBtn}
            onClick={() => navigate('/projects')}
          >
            <span className={styles.nextChapterTitle}>
              Chapter II — The Workshop
            </span>
            <span className={styles.nextChapterHint}>
              See what I’ve been building <MdArrowOutward aria-hidden="true" />
            </span>
          </button>
        </footer>
      </div>
    </section>
  );
};

export default Bio;
