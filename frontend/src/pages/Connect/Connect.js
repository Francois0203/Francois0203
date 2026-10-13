import { useEffect, useMemo, useState } from 'react';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import { resolveGroup } from '../../content/copy/resolve';
import { CONNECT_FIELDS } from '../../content/copy/connect';
import { CREDENTIALS_FIELDS } from '../../content/copy/credentials';
import { isCurrent } from '../../content/records';
import { submitContactForm } from '../../firebase/firestore';
import { useToast } from '../../components';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import Shape from '../../components/Shape';
import SupportButton from '../../components/SupportButton';
import SocialIcon, { platformFor } from '../../components/SocialIcon';
import { toCredential, onPath } from '../../components/Credentials';
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
  const { toast } = useToast();
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(CONNECT_FIELDS, overrides.connect);
  const badges = resolveGroup(CREDENTIALS_FIELDS, overrides.credentials);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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
    const exams = (data?.certifications ?? []).filter(onPath).map(toCredential)
      .filter(c => c.status === 'booked' || c.status === 'studying')
      .sort((a, b) => a.order - b.order)
      .slice(0, 1)
      .map(c => ({
        id: `cert-${c.id ?? c.code}`,
        shape: 'hexagon',
        colour: 'yellow',
        title: c.name,
        detail: c.status === 'booked' ? [badges.statusBooked, c.examDate].filter(Boolean).join(', ') : badges.statusStudying,
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

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form, t);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });

    if (Object.values(found).some(Boolean)) {
      document.getElementById(Object.keys(found).find(k => found[k]))?.focus();
      return;
    }

    setSending(true);
    try {
      await submitContactForm(form);
      setSent(true);
      setForm(EMPTY);
      setTouched({});
    } catch {
      toast.error(t.sendFailed);
    } finally {
      setSending(false);
    }
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
  const [headRef, headShown] = useReveal({ threshold: 0 });
  const [supportRef, supportShown] = useReveal({ threshold: 0.2 });

  return (
    <div className={styles.page}>
      <section ref={headRef} className={styles.top} data-shown={headShown ? '' : undefined}>
        <div className={styles.side}>
          <div data-rise style={{ '--i': 0 }}>
            <Chip dot="live">{t.eyebrow}</Chip>
          </div>
          <Headline as="h1" text={t.heading} tone="orange" className={styles.title} start={1} />
          <p className={styles.lede} data-rise style={{ '--i': 4 }}>{t.intro}</p>

          <div className={styles.ways} data-rise style={{ '--i': 5 }}>
            <h2 className={styles.waysTitle}>{t.waysTitle}</h2>

            {contact.email && (
              <div className={styles.way}>
                <span className={styles.wayKey}>email</span>
                <a className={styles.wayValue} href={`mailto:${contact.email}`}>{contact.email}</a>
                <button type="button" className={styles.copy} onClick={copyEmail}>{t.copyLabel}</button>
              </div>
            )}

            {contact.phone && (
              <div className={styles.way}>
                <span className={styles.wayKey}>phone</span>
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
          </div>
        </div>

        <div className={styles.letterWrap} data-rise style={{ '--i': 3, '--rise': '24px' }}>
          <div className={styles.letter}>
            <span className={styles.stamp} aria-hidden="true">
              <Shape kind="star" colour="orange" className={styles.stampShape} />
            </span>
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
                <Button variant="line" onClick={() => setSent(false)}>{t.sentAgain}</Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className={styles.form}>
                <p className={styles.greeting}>{t.letterGreeting}</p>

                <p className={styles.sentence}>
                  {t.letterName}{' '}
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    aria-label="Your name"
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
                    aria-label="Your email"
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
                  aria-label="Your message"
                  placeholder={t.letterPlaceholder}
                  className={styles.ruled}
                  value={form.message}
                  onChange={change}
                  onBlur={blur}
                  aria-invalid={Boolean(shownError('message'))}
                  aria-describedby={shownError('message') ? 'message-error' : undefined}
                />
                {shownError('message') && <p className={styles.error} id="message-error">{shownError('message')}</p>}

                <div className={styles.letterFoot}>
                  <p className={styles.signOff}>
                    {t.letterSignOff}
                    <span className={styles.signature} data-empty={form.name.trim() ? undefined : ''}>
                      {form.name.trim() || '...'}
                    </span>
                  </p>
                  <Button type="submit" variant="fill" size="lg" disabled={sending} arrow>
                    {sending ? t.sendingLabel : t.sendLabel}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {support && (
        <section ref={supportRef} className={styles.support} data-shown={supportShown ? '' : undefined}>
          <div className={styles.supportCopy}>
            <Headline as="h2" text={t.supportTitle} tone="orange" className={styles.supportTitle} />
            {donation.message && <p className={styles.supportText} data-rise style={{ '--i': 3 }}>{donation.message}</p>}
            <div data-rise style={{ '--i': 4 }}>
              <SupportButton href={donation.link}>{donation.buttonText || t.supportButton}</SupportButton>
            </div>
          </div>

          {studying.length > 0 && (
            <div className={styles.studying} data-rise style={{ '--i': 3 }}>
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
