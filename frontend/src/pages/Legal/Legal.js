import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import usePortfolioData from '../../hooks/usePortfolioData';
import useReveal from '../../hooks/useReveal';
import Chip from '../../components/Chip';
import { LEGAL_FALLBACK_EMAIL } from '../../content/legal';
import { parseLegal } from '../../content/copy/legal';
import { useCopy } from '../../content/copy/store';
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

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// The privacy or terms page, worded from the admin's Privacy and terms copy.
const Legal = ({ kind, otherTo }) => {
  const { data } = usePortfolioData();
  const t = useCopy('legal');
  const email = data?.contact?.email || LEGAL_FALLBACK_EMAIL;
  const doc = {
    title: t[`${kind}Title`],
    intro: t[`${kind}Intro`].replaceAll('{email}', email),
    sections: parseLegal(t[`${kind}Body`], email),
  };
  const other = { to: otherTo, label: t[`${kind}Other`] };
  const [ref, shown] = useReveal({ threshold: 0 });

  return (
    <div ref={ref} className={styles.page} data-shown={shown ? '' : undefined}>
      <span className={styles.progress} aria-hidden="true" />

      <header className={styles.head}>
        <div data-rise style={{ '--i': 0 }}>
          <Chip dot="ink">{t.updatedLabel} {t.updated}</Chip>
        </div>
        <h1 className={styles.title}>
          <span className="mask"><span style={{ '--i': 1 }}>{doc.title}</span></span>
        </h1>
        <p className={styles.intro} data-rise style={{ '--i': 2 }}>{doc.intro}</p>
      </header>

      <div className={styles.layout}>
        <nav className={`glass ${styles.toc}`} aria-label={doc.title} data-rise style={{ '--i': 3 }}>
          {doc.sections.map((s, i) => (
            <a key={i} href={`#${slug(s.heading)}`} className={styles.tocLink}>
              <span className={styles.tocNum}>{String(i + 1).padStart(2, '0')}</span>
              {s.heading}
            </a>
          ))}
        </nav>

        <article className={`glass ${styles.sheet}`} data-tone="blue" data-rise style={{ '--i': 3, '--rise': '30px' }}>
          {doc.sections.map((s, i) => (
            <section key={i} id={slug(s.heading)} className={styles.section}>
              <h2 className={styles.heading}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                {s.heading}
              </h2>
              {s.blocks.map((b, j) => (Array.isArray(b)
                ? <ul key={j}>{b.map(item => <li key={item}><Inline text={item} /></li>)}</ul>
                : <p key={j}><Inline text={b} /></p>))}
            </section>
          ))}
          <p className={styles.other}>{t.seeAlso} <Link to={other.to}>{other.label}</Link>.</p>
        </article>
      </div>
    </div>
  );
};

export const Privacy = () => <Legal kind="privacy" otherTo="/terms" />;
export const Terms = () => <Legal kind="terms" otherTo="/privacy" />;
