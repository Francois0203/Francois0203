import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import usePortfolioData from '../../hooks/usePortfolioData';
import Chip from '../../components/Chip';
import { LEGAL_UPDATED, LEGAL_FALLBACK_EMAIL, privacyPolicy, termsOfUse } from '../../content/legal';
import styles from './Legal.module.css';

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

// Plain text with [text](url) links. Site paths stay in the app, the rest open as normal links.
const Inline = ({ text }) => {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    parts.push(href.startsWith('/')
      ? <Link key={m.index} to={href}>{label}</Link>
      : <a key={m.index} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{label}</a>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
};

const Legal = ({ build, other }) => {
  const { data } = usePortfolioData();
  const email = data?.contact?.email || LEGAL_FALLBACK_EMAIL;
  const doc = build({ email });

  return (
    <article className={styles.page}>
      <header className={styles.head}>
        <Chip dot="off">updated {LEGAL_UPDATED}</Chip>
        <h1 className={styles.title}>{doc.title}</h1>
        <p className={styles.intro}>{doc.intro}</p>
      </header>

      {doc.sections.map((s, i) => (
        <section key={s.heading} className={styles.section}>
          <h2 className={styles.heading}><span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>{s.heading}</h2>
          {s.blocks.map((b, j) => (Array.isArray(b)
            ? <ul key={j}>{b.map(item => <li key={item}><Inline text={item} /></li>)}</ul>
            : <p key={j}><Inline text={b} /></p>))}
        </section>
      ))}

      <p className={styles.other}>See also the <Link to={other.to}>{other.label}</Link>.</p>
    </article>
  );
};

export const Privacy = () => <Legal build={privacyPolicy} other={{ to: '/terms', label: 'terms of use' }} />;
export const Terms = () => <Legal build={termsOfUse} other={{ to: '/privacy', label: 'privacy policy' }} />;
