import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import { resolveGroup } from '../../content/copy/resolve';
import { CONNECT_FIELDS } from '../../content/copy/connect';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { isCurrent } from '../../content/records';
import { submitContactForm } from '../../firebase/firestore';
import { useToast } from '../../components';
import useAsyncAction from '../../hooks/useAsyncAction';
import Draggable from '../../components/Draggable';
import Button from '../../components/Button';
import Glass from '../../components/Glass';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import Shape from '../../components/Shape';
import Skeleton, { Bone } from '../../components/Skeleton';
import SupportButton from '../../components/SupportButton';
import SocialIcon, { platformFor } from '../../components/SocialIcon';
import { toCredential } from '../../components/Credentials';
import { useCopy } from '../../content/copy/store';
import styles from './Connect.module.css';

const EMPTY = { name: '', email: '', message: '' };

const validate = ({ name, email, message }, t) => ({
  name: !name.trim() ? t.nameMissing : '',
  email: !email.trim()
    ? t.emailMissing
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? t.emailInvalid : '',
  message: !message.trim() ? t.messageMissing : '',
});

// The last useful part of a profile URL, e.g. github.com/name -> name.
const handleOf = (url = '') => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const useClock = (timeZone) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);
  try {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(now);
  } catch {
    return '';
  }
};

const postmarkDate = () =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()).toUpperCase();

const Connect = () => {
  const a11y = useCopy('a11y');
  const { toast } = useToast();
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(CONNECT_FIELDS, overrides.connect);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);
  const [trap, setTrap] = useState('');
  const openedAt = useRef(Date.now());
  useEffect(() => { if (!sent) openedAt.current = Date.now(); }, [sent]);

  const send = useAsyncAction(async () => {
    try {
      await submitContactForm({ ...form, company: trap, elapsed: Date.now() - openedAt.current });
    } catch (err) {
      if (err.limit) toast.warning(err.limit === 'everyone' ? t.limitEveryone : t.limitSender, { title: t.limitTitle });
      else toast.error(t.sendFailed, { title: t.sendFailedTitle });
      throw err;
    }
    toast.success(t.sentTitle);
    setTimeout(() => { setSent(true); setForm(EMPTY); setTouched({}); }, 1100);
  });

  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const donation = data?.donation ?? {};
  const support = !loading && donation.enabled && /^https?:\/\//i.test(donation.link ?? '');
  const time = useClock(t.timeZone);

  const studying = useMemo(() => {
    const degrees = (data?.education ?? []).filter(isCurrent).map(e => ({
      id: `edu-${e.id}`,
      shape: 'circle',
      colour: 'blue',
      title: [e.degree, e.field].filter(Boolean).join(' in ') || e.institution,
      detail: e.institution,
    }));
    const exams = (data?.certifications ?? []).map(toCredential)
      .filter(c => c.status === 'booked' || c.status === 'studying')
      .sort((a, b) => a.order - b.order)
      .slice(0, 1)
      .map(c => ({
        id: `cert-${c.id ?? c.code}`,
        shape: 'hexagon',
        colour: 'yellow',
        title: c.name,
        detail: c.status === 'booked' ? [badges.statusBooked, c.date].filter(Boolean).join(', ') : badges.statusStudying,
      }));
    return [...degrees, ...exams];
  }, [data, badges.statusBooked, badges.statusStudying]);

  const change = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) setErrors(validate(next, t));
  };

  const blur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
    setErrors(validate(form, t));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form, t);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });

    if (Object.values(found).some(Boolean)) {
      send.fail();
      document.getElementById(Object.keys(found).find(k => found[k]))?.focus();
      return;
    }
    send.run();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      toast.success(t.copiedLabel);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  const shownError = (k) => (touched[k] && errors[k]) || '';

  return (
    <div className={styles.page}>
      <section className={styles.top}>
        <div className={styles.side}>
          <div data-rise style={{ '--i': 0 }}>
            <Chip dot="live">{t.eyebrow}</Chip>
          </div>
          <Headline as="h1" text={t.heading} tone="orange" className={styles.title} start={1} />
          <p className={styles.lede} data-rise style={{ '--i': 4 }}>{t.intro}</p>

          <Glass className={styles.ways} tone="blue" data-rise="turn" style={{ '--i': 5 }}>
            <h2 className={styles.waysTitle}>{t.waysTitle}</h2>

            {loading && (
              <Skeleton label={a11y.loadingContact}>
                {['70%', '45%'].map(w => (
                  <div key={w} className={styles.way}><Bone w="3rem" h="0.8rem" /><Bone w={w} h="1.1rem" /></div>
                ))}
              </Skeleton>
            )}

            {contact.email && (
              <div className={styles.way}>
                <span className={styles.wayKey}>{t.emailKey}</span>
                <a className={styles.wayValue} href={`mailto:${contact.email}`}>{contact.email}</a>
                <button type="button" className={styles.copy} onClick={copyEmail}>{t.copyLabel}</button>
              </div>
            )}

            {contact.phone && (
              <div className={styles.way}>
                <span className={styles.wayKey}>{t.phoneKey}</span>
                <a className={styles.wayValue} href={`tel:${String(contact.phone).replace(/\s+/g, '')}`}>{contact.phone}</a>
              </div>
            )}

            {time && (
              <div className={styles.way}>
                <span className={styles.wayKey}>{t.clockLabel}</span>
                <span className={styles.wayValue}>
                  <span className={styles.time}>{time}</span>
                  {contact.location && <span className={styles.place}>{contact.location}</span>}
                </span>
              </div>
            )}

            {loading && (
              <Skeleton label={a11y.loadingProfiles}>
                <h3 className={styles.waysSub}>{t.socialCardTitle}</h3>
                <ul className={styles.tiles}>
                  {[0, 1, 2, 3].map(i => <li key={i}><Bone h="3.6rem" r="var(--r-node)" /></li>)}
                </ul>
              </Skeleton>
            )}

            {social.length > 0 && (
              <>
                <h3 className={styles.waysSub}>{t.socialCardTitle}</h3>
                <ul className={styles.tiles} data-tones>
                  {social.map((s, i) => {
                    const p = platformFor(s.key, s.url);
                    const label = p.key === 'website' ? (s.platform || s.key) : p.label;
                    return (
                      <li key={s.key ?? i}>
                        <a className={styles.tile} href={s.url} target="_blank" rel="noopener noreferrer">
                          <span className={styles.tileIcon}><SocialIcon platform={s.key} url={s.url} /></span>
                          <span className={styles.tileText}>
                            <span className={styles.tileName}>{label}</span>
                            <span className={styles.tileHandle}>{handleOf(s.url)}</span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Glass>
        </div>

        <div className={styles.letterWrap} data-rise style={{ '--i': 3, '--rise': '24px' }}>
          <Glass className={styles.letter} tone="orange" tilt={2} strong pad="lg">
            <Draggable className={styles.stamp} aria-hidden="true">
              <Shape kind="star" colour="orange" className={styles.stampShape} />
            </Draggable>
            <span className={styles.postmark} aria-hidden="true">{postmarkDate()}</span>

            {sent ? (
              <div className={styles.sent} role="status">
                <span className={styles.sentMark} aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M6 17.5 12.5 24 26 9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h2>{t.sentTitle}</h2>
                <p>{t.sentText}</p>
                <Button variant="glass" tone="orange" onClick={() => setSent(false)}>{t.sentAgain}</Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className={styles.form}>
                <div className={styles.trap} aria-hidden="true">
                  <label htmlFor="company">{a11y.trapLabel}</label>
                  <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
                </div>
                <p className={styles.greeting}>{t.letterGreeting}</p>

                <p className={styles.sentence}>
                  {t.letterName}{' '}
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    aria-label={a11y.yourName}
                    className={styles.blank}
                    style={{ '--w': `${Math.max(8, form.name.length + 1)}ch` }}
                    value={form.name}
                    onChange={change}
                    onBlur={blur}
                    aria-invalid={Boolean(shownError('name'))}
                    aria-describedby={shownError('name') ? 'name-error' : undefined}
                  />{' '}
                  {t.letterEmail}{' '}
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    aria-label={a11y.yourEmail}
                    className={styles.blank}
                    style={{ '--w': `${Math.max(14, form.email.length + 1)}ch` }}
                    value={form.email}
                    onChange={change}
                    onBlur={blur}
                    aria-invalid={Boolean(shownError('email'))}
                    aria-describedby={shownError('email') ? 'email-error' : undefined}
                  />.
                </p>
                {shownError('name') && <p className={styles.error} id="name-error">{shownError('name')}</p>}
                {shownError('email') && <p className={styles.error} id="email-error">{shownError('email')}</p>}

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  maxLength={5000}
                  aria-label={a11y.yourMessage}
                  placeholder={t.letterPlaceholder}
                  className={styles.ruled}
                  value={form.message}
                  onChange={change}
                  onBlur={blur}
                  aria-invalid={Boolean(shownError('message'))}
                  aria-describedby={shownError('message') ? 'message-error' : undefined}
                />
                {shownError('message') && <p className={styles.error} id="message-error">{shownError('message')}</p>}

                <p className={styles.privacy}>
                  {t.privacyNote} <Link to="/privacy">{t.privacyLink}</Link>
                </p>

                <div className={styles.letterFoot}>
                  <p className={styles.signOff}>
                    {t.letterSignOff}
                    <span className={styles.signature} data-empty={form.name.trim() ? undefined : ''}>
                      {form.name.trim() || '...'}
                    </span>
                  </p>
                  <Button type="submit" variant="primary" tone="orange" size="lg" status={send.status} arrow>
                    {t.sendLabel}
                  </Button>
                </div>
              </form>
            )}
          </Glass>
        </div>
      </section>

      {support && (
        <section className={`glass ${styles.support}`} data-tone="yellow">
          <div className={styles.supportCopy}>
            <Headline as="h2" text={t.supportTitle} tone="orange" className={styles.supportTitle} />
            {donation.message && <p className={styles.supportText} data-rise="pop" style={{ '--i': 3 }}>{donation.message}</p>}
            <div data-rise style={{ '--i': 4 }}>
              <SupportButton href={donation.link}>{donation.buttonText || t.supportButton}</SupportButton>
            </div>
          </div>

          {studying.length > 0 && (
            <div className={styles.studying} data-rise="pop" style={{ '--i': 3 }}>
              <span className={styles.studyingLabel}>{t.supportStudyingLabel}</span>
              <ul>
                {studying.map(s => (
                  <li key={s.id}>
                    <Shape kind={s.shape} colour={s.colour} className={styles.studyShape} />
                    <span>
                      <strong>{s.title}</strong>
                      {s.detail && <small>{s.detail}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Connect;
