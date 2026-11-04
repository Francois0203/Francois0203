import { Link, useLocation } from 'react-router-dom';
import { MdArrowUpward, MdArrowForward } from 'react-icons/md';
import { nextPage, tabStyle, useNavPages } from '../../content/navigation';
import { useCopy } from '../../content/copy/store';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
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
  const [ref, shown] = useReveal({ threshold: 0.2 });

  const personal = data?.personal ?? {};
  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const site = useCopy('site');
  const words = useCopy('a11y');
  const pages = useNavPages();
  const name = personal.name || site.name;

  const tools = (data?.skills?.categories ?? []).flatMap(c => c.items ?? [])
    .map(i => (typeof i === 'string' ? i : i?.name)).filter(Boolean);

  const nextBase = nextPage(pathname);
  const next = nextBase && pages.find(pg => pg.to === nextBase.to);
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className={styles.foot} data-print-hide>
      <div className={styles.inner}>
        {pathname !== '/connect' && (
          <div ref={ref} className={`glass ${styles.call}`} data-tone="pink" data-shown={shown ? '' : undefined}>
            <span className={styles.halo} aria-hidden="true" />
            <div className={styles.callCopy}>
              <Headline as="h2" text={t.ctaTitle} tone="yellow" className={styles.callTitle} />
              <p className={styles.callText} data-rise style={{ '--i': 5 }}>{t.ctaText}</p>
            </div>
            <div className={styles.callSide} data-rise style={{ '--i': 6 }}>
              <div className={styles.callActions}>
                <Button as={Link} to="/connect" variant="primary" tone="pink" size="lg" arrow>{t.ctaButton}</Button>
                {contact.email && <Button as="a" href={`mailto:${contact.email}`} variant="glass">{contact.email}</Button>}
              </div>
              {social.length > 0 && (
                <ul className={styles.social} data-tones>
                  {social.map((s, i) => {
                    const p = platformFor(s.key, s.url);
                    const label = p.key === 'website' ? (s.platform || s.key) : p.label;
                    return (
                      <li key={s.key ?? i} style={{ '--i': i }}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                          <SocialIcon platform={s.key} url={s.url} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {pathname === '/' && <Playground items={[...new Set(tools)]} caption={t.stackCaption} />}

        <div className={`glass ${styles.base}`} data-tone="blue">
          <nav className={styles.pages} aria-label={words.pagesNav}>
            {pages.map((page) => (
              <Link key={page.to} to={page.to} className={styles.page} style={tabStyle(page.tone)} aria-current={page.to === pathname ? 'page' : undefined}>
                <span className={styles.pageDot} aria-hidden="true" />
                {page.label}
              </Link>
            ))}
          </nav>

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
