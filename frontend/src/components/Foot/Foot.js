import { Link, useLocation } from 'react-router-dom';
import { MdArrowUpward, MdArrowForward } from 'react-icons/md';
import { NAVIGATION_PAGES, nextPage, tabStyle } from '../../content/navigation';
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
  const name = personal.name ?? 'Francois Meiring';

  const tools = (data?.skills?.categories ?? []).flatMap(c => c.items ?? [])
    .map(i => (typeof i === 'string' ? i : i?.name)).filter(Boolean);

  const next = nextPage(pathname);
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className={styles.foot} data-print-hide>
      <div className={styles.inner}>
        {pathname !== '/connect' && (
          <div ref={ref} className={styles.call} data-shown={shown ? '' : undefined}>
            <Headline as="h2" text={t.ctaTitle} className={styles.callTitle} />
            <p className={styles.callText} data-rise style={{ '--i': 5 }}>{t.ctaText}</p>
            <div className={styles.callActions} data-rise style={{ '--i': 6 }}>
              <Button as={Link} to="/connect" variant="fill" arrow>{t.ctaButton}</Button>
              {contact.email && <Button as="a" href={`mailto:${contact.email}`} variant="line">{contact.email}</Button>}
            </div>
            {social.length > 0 && (
              <ul className={styles.social} data-tones data-rise style={{ '--i': 7 }}>
                {social.map((s, i) => {
                  const p = platformFor(s.key, s.url);
                  const label = p.key === 'website' ? (s.platform || s.key) : p.label;
                  return (
                    <li key={s.key ?? i}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                        <SocialIcon platform={s.key} url={s.url} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <Playground items={[...new Set(tools)]} caption={t.stackCaption} />

        <div className={styles.strip}>
          <span className={styles.stripLabel}>Pages</span>
          <nav className={styles.pages} aria-label="Site pages">
            {NAVIGATION_PAGES.map((page) => (
              <Link key={page.to} to={page.to} className={styles.page} style={tabStyle(page.tone)} aria-current={page.to === pathname ? 'page' : undefined}>
                <span className={styles.pageDot} aria-hidden="true" />
                {page.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.fine}>
          <p className={styles.sign}><Monogram size={28} /> {name}, {year}</p>
          {next && (
            <Link to={next.to} className={styles.next}>
              {t.nextLabel}: {next.label}
              <MdArrowForward aria-hidden="true" />
            </Link>
          )}
          <button type="button" className={styles.toTop} onClick={() => scrollPageTo(0)}>
            {t.topLabel}
            <MdArrowUpward aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Foot;
