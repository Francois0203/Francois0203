import { Link, useLocation } from 'react-router-dom';
import { MdArrowUpward, MdArrowForward } from 'react-icons/md';
import { nextPage, useNavPages } from '../../content/navigation';
import { useCopy } from '../../content/copy/store';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import { scrollPageTo } from '../../hooks';
import { resolveGroup } from '../../content/copy/resolve';
import { FOOTER_FIELDS } from '../../content/copy/footer';
import Button from '../Button';
import Headline from '../Headline';
import Playground from '../Playground';
import Monogram from '../Monogram';
import SocialIcon, { platformFor } from '../SocialIcon';
import styles from './Foot.module.css';

const Foot = () => {
  const { pathname } = useLocation();
  const { data } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(FOOTER_FIELDS, overrides.footer);

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const site = useCopy('site');
  const words = useCopy('a11y');
  const pages = useNavPages();
  const name = personal.name || site.name;

  const toolGroups = (data?.skills?.categories ?? []).map(c => ({
    name: c.name,
    items: [...new Set((c.items ?? []).map(i => (typeof i === 'string' ? i : i?.name)).filter(Boolean))],
  })).filter(g => g.name && g.items.length);

  const nextBase = nextPage(pathname);
  const next = nextBase && pages.find(pg => pg.to === nextBase.to);
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className={styles.foot} data-print-hide>
      {pathname === '/' && (
        <div className={styles.play}><Playground groups={toolGroups} caption={t.stackCaption} /></div>
      )}

      {/* The page ends on one raised floor, with the stripe as its horizon */}
      <div className={styles.night}>
        <div className={styles.inner}>
          <div className={styles.top}>
            {pathname !== '/connect' ? (
              <div className={styles.call}>
                <Headline as="h2" text={t.ctaTitle} tone="yellow" className={styles.callTitle} />
                <p className={styles.callText} data-rise style={{ '--i': 5 }}>{t.ctaText}</p>
                <div className={styles.callActions} data-rise style={{ '--i': 6 }}>
                  <Button as={Link} to="/connect" variant="primary" tone="pink" size="lg" arrow>{t.ctaButton}</Button>
                  {contact.email && <Button as="a" href={`mailto:${contact.email}`} variant="soft" size="lg">{contact.email}</Button>}
                </div>
              </div>
            ) : (
              <p className={styles.mark}><Monogram size={44} /> {name}</p>
            )}

            <nav className={styles.col} aria-label={words.pagesNav}>
              <p className={styles.colTitle}>{t.pagesTitle}</p>
              {pages.map((page) => (
                <Link key={page.to} to={page.to} className={styles.page} aria-current={page.to === pathname ? 'page' : undefined}>
                  {page.label}
                </Link>
              ))}
            </nav>

            {social.length > 0 && (
              <div className={styles.col}>
                <p className={styles.colTitle}>{t.socialTitle}</p>
                <ul className={styles.social} aria-label={t.socialTitle} data-tones>
                  {social.map((s, i) => {
                    const p = platformFor(s.key, s.url);
                    const label = p.key === 'website' ? (s.platform || s.key) : p.label;
                    return (
                      <li key={s.key ?? i}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          <SocialIcon platform={s.key} url={s.url} />
                          {label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.fine}>
            <p className={styles.sign}><Monogram size={24} /> &copy; {year} {name}</p>
            <nav className={styles.legal} aria-label={words.legalNav}>
              <Link to="/privacy">{site.privacyLink}</Link>
              <Link to="/terms">{site.termsLink}</Link>
            </nav>
            <div className={styles.moves}>
              {next && (
                <Link to={next.to} className={styles.move}>
                  {t.nextLabel}: {next.label}
                  <MdArrowForward aria-hidden="true" />
                </Link>
              )}
              <button type="button" className={styles.move} onClick={() => scrollPageTo(0)}>
                {t.topLabel}
                <MdArrowUpward aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Foot;
