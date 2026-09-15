import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_PAGES, nextPage } from '../../content/navigation';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import { scrollPageTo } from '../../hooks';
import { resolveGroup } from '../../content/copy/resolve';
import { FOOTER_FIELDS } from '../../content/copy/footer';
import Button from '../Button';
import Embers from '../Embers';
import styles from './Foot.module.css';

/*
 * The end of every page, and the second band of deep ground. Mounted once
 * in the layout, so there is no per page copy to fall behind. Contact
 * details come from the documents Connect reads, so the two cannot differ.
 */
const Foot = () => {
  const { pathname } = useLocation();
  const { data } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(FOOTER_FIELDS, overrides.footer);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];

  const next = nextPage(pathname);
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className={`${styles.foot} on-deep`}>
      <Embers count={16} />

      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.call}>
            <h2 className={styles.callTitle}>{t.ctaTitle}</h2>
            <p className={styles.callText}>{t.ctaText}</p>
            <Button as={Link} to="/connect" variant="fill">{t.ctaButton}</Button>
          </div>

          {/* Absent on the 404, which is not one of the four pages. */}
          {next && (
            <Link to={next.to} className={styles.next}>
              <span className={styles.nextLabel}>{t.nextLabel}</span>
              <span className={styles.nextName}>{next.label}</span>
              <span className={styles.nextBlurb}>{next.blurb}</span>
              <span className={styles.nextArrow} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          )}
        </div>

        <div className={styles.strip}>
          <nav className={styles.pages} aria-label="Site pages">
            {NAVIGATION_PAGES.map((page, i) => (
              <Link
                key={page.to}
                to={page.to}
                className={styles.page}
                style={{ '--i': i }}
                aria-current={page.to === pathname ? 'page' : undefined}
              >
                {page.label}
              </Link>
            ))}
          </nav>

          <div className={styles.reach}>
            {contact.email && (
              <a className={styles.link} href={`mailto:${contact.email}`}>{contact.email}</a>
            )}
            {social.map((s, i) => (
              <a
                key={s.key ?? i}
                className={styles.link}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* `key` is only a fallback, or this reads as slugs. */}
                {s.platform || s.display || s.label || s.key}
              </a>
            ))}
          </div>
        </div>

        <div className={styles.fine}>
          <p>{[personal.name, year].filter(Boolean).join(', ')}</p>
          <button
            type="button"
            className={styles.toTop}
            onClick={() => scrollPageTo(0)}
          >
            {t.topLabel}
            <span className={styles.topArrow} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Foot;
