import { Link, useLocation } from 'react-router-dom';
import { MdArrowOutward, MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';
import { NAVIGATION_PAGES, nextPage } from '../../content/navigation';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import { resolveGroup } from '../../content/copy/resolve';
import { FOOTER_FIELDS } from '../../content/copy/footer';
import { getSocialIcon } from '../../content/socialIcons';
import styles from './SiteFooter.module.css';

/**
 * One footer, on every page.
 *
 * ── What this replaced ───────────────────────────────────────────────────────
 * Four pages had four different ways of pointing at each other. Home and
 * Projects each ended with their own closing panel and a pair of buttons; Bio
 * ended with a "Turn the page - Chapter III" card; Connect, the page a visitor
 * is most likely to finish on, ended with nothing at all and left them at a
 * dead end. The three that existed had drifted apart in wording and in shape,
 * and each one only ever pointed at one other page.
 *
 * It is mounted once in the app layout rather than included per page, so it is
 * consistent by construction: there is no per-page copy of it to fall behind.
 * That also means it cannot be forgotten on a page added later.
 *
 * ── What it carries ──────────────────────────────────────────────────────────
 *   1. The next page, so there is a way forward from every page including the
 *      last, which wraps back to the start.
 *   2. Every page, marked with which one you are on. A visitor who wants a
 *      specific section should not have to scroll back to the nav for it.
 *   3. The real contact details and social links, read from the same documents
 *      the Connect page reads, so they cannot disagree.
 *
 * ── Availability ─────────────────────────────────────────────────────────────
 * The availability line is footer copy, in one place. It used to be written
 * into the closing text of both Home and Projects, which is how the site ended
 * up claiming to be "open to work" on two pages after that stopped being true.
 */
const SiteFooter = () => {
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
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* ── The way forward ──────────────────────────────────────────────
             Omitted rather than guessed at on a route that is not one of the
             four pages, which is the 404. */}
        {next && (
          <Link to={next.to} className={styles.next}>
            <span className={styles.nextLabel}>{t.nextLabel}</span>
            <span className={styles.nextTitle}>
              {next.label}
              <MdArrowOutward aria-hidden="true" />
            </span>
            <span className={styles.nextBlurb}>{next.blurb}</span>
          </Link>
        )}

        {/* ── The call to action, and the availability statement ─────────── */}
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>{t.ctaTitle}</h2>
          <p className={styles.ctaText}>{t.ctaText}</p>
          <Link to="/connect" className={styles.ctaButton}>
            <MdEmail aria-hidden="true" />
            {t.ctaButton}
          </Link>
        </div>

        <div className={styles.columns}>
          {/* ── Every page ───────────────────────────────────────────────── */}
          <nav className={styles.column} aria-label="Site pages">
            <h3 className={styles.columnHeading}>{t.navHeading}</h3>
            <ul className={styles.list}>
              {NAVIGATION_PAGES.map(page => {
                const current = page.to === pathname;
                return (
                  <li key={page.to}>
                    {/* A real link, not a button, so middle-click and
                        cmd-click open it in a tab and screen readers announce
                        it as a link. */}
                    <Link
                      to={page.to}
                      className={styles.link}
                      aria-current={current ? 'page' : undefined}
                    >
                      {page.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Contact ──────────────────────────────────────────────────── */}
          {(contact.email || contact.phone || contact.location) && (
            <div className={styles.column}>
              <h3 className={styles.columnHeading}>{t.reachHeading}</h3>
              <ul className={styles.list}>
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className={styles.link}>
                      <MdEmail aria-hidden="true" />
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li>
                    <a href={`tel:${String(contact.phone).replace(/\s+/g, '')}`} className={styles.link}>
                      <MdPhone aria-hidden="true" />
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.location && (
                  <li className={styles.plain}>
                    <MdLocationOn aria-hidden="true" />
                    {contact.location}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* ── Social ───────────────────────────────────────────────────── */}
          {social.length > 0 && (
            <div className={styles.column}>
              <h3 className={styles.columnHeading}>{t.socialHeading}</h3>
              <ul className={`${styles.list} ${styles.socialList}`}>
                {social.map((s, i) => {
                  const Icon = getSocialIcon(s.key);
                  return (
                    <li key={s.key ?? i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        <Icon aria-hidden="true" />
                        {/* `platform` is the display name in the social
                            document ("LinkedIn"); `key` is the lowercase
                            lookup key ("linkedin") and is only a fallback, or
                            the column reads as a list of slugs. */}
                        {s.platform || s.display || s.label || s.key}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <p className={styles.fine}>
          {personal.name ? `${personal.name}, ${year}` : year}
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
