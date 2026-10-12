import { useState } from 'react';
import usePortfolioData from '../../hooks/usePortfolioData';
import useSiteCopy from '../../hooks/useSiteCopy';
import useReveal from '../../hooks/useReveal';
import { resolveGroup } from '../../content/copy/resolve';
import { CONNECT_FIELDS } from '../../content/copy/connect';
import { submitContactForm } from '../../firebase/firestore';
import { useToast } from '../../components';
import Slab from '../../components/Slab';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Headline from '../../components/Headline';
import Drift from '../../components/Drift';
import SupportButton from '../../components/SupportButton';
import SocialIcon from '../../components/SocialIcon';
import styles from './Connect.module.css';

const EMPTY = { name: '', email: '', message: '' };

const validate = ({ name, email, message }) => ({
  name: !name.trim() ? 'Your name, so I know who I am replying to.' : '',
  email: !email.trim()
    ? 'An address I can reach you at.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'That does not look like an email address.'
      : '',
  message: !message.trim() ? 'Say something, even if it is short.' : '',
});

const Field = ({ id, label, error, children }) => (
  <div className={styles.field}>
    <label htmlFor={id}>{label}</label>
    <div className={styles.control}>
      {children}
      <span className={styles.underline} aria-hidden="true" />
    </div>
    {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
  </div>
);

const Connect = () => {
  const { toast } = useToast();
  const { data, loading } = usePortfolioData();
  const { overrides } = useSiteCopy();
  const t = resolveGroup(CONNECT_FIELDS, overrides.connect);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const contact = data?.contact ?? {};
  const social = data?.social ?? [];
  const donation = data?.donation ?? {};
  const support = !loading && donation.enabled && /^https?:\/\//i.test(donation.link ?? '');

  const change = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) setErrors(validate(next));
  };

  const blur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
    setErrors(validate(form));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
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
      toast.error('That did not send. Try again, or email me directly.');
    } finally {
      setSending(false);
    }
  };

  const [ref, shown] = useReveal({ threshold: 0 });

  return (
    <div
      ref={ref}
      className={styles.page}
      data-shown={shown ? '' : undefined}
    >
      <Drift shapes={[
        { kind: 'star', colour: 'orange', x: '100%', y: '150px', size: 'clamp(180px, 22vw, 320px)', speed: 0.6, spin: 25, wide: true },
      ]} />
      <div className={styles.side}>
        <div data-rise style={{ '--i': 0 }}>
          <Chip dot="live">{t.eyebrow}</Chip>
        </div>

        <Headline as="h1" text={t.heading} tone="orange" className={styles.title} start={1} />

        <p className={styles.lede} data-rise style={{ '--i': 4 }}>{t.intro}</p>

        <dl className={styles.details} data-rise style={{ '--i': 5 }}>
          {loading && <dd className={styles.plain}>loading</dd>}

          {!loading && contact.email && (
            <>
              <dt>email</dt>
              <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
            </>
          )}

          {!loading && contact.phone && (
            <>
              <dt>phone</dt>
              <dd><a href={`tel:${String(contact.phone).replace(/\s+/g, '')}`}>{contact.phone}</a></dd>
            </>
          )}

          {!loading && contact.location && (
            <>
              <dt>based</dt>
              <dd className={styles.plain}>{contact.location}</dd>
            </>
          )}

          {!loading && social.length > 0 && (
            <>
              <dt>{t.socialCardTitle}</dt>
              <dd className={styles.social}>
                {social.map((s, i) => (
                  <a key={s.key ?? i} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <SocialIcon platform={s.key} url={s.url} className={styles.socialIcon} />
                    {s.platform || s.display || s.label || s.key}
                  </a>
                ))}
              </dd>
            </>
          )}
        </dl>

        {support && (
          <div className={styles.support} data-rise style={{ '--i': 6 }}>
            {donation.message && <p>{donation.message}</p>}
            <SupportButton href={donation.link}>
              {donation.buttonText || t.supportButton}
            </SupportButton>
          </div>
        )}
      </div>

      <Slab className={styles.form} data-rise style={{ '--i': 3, '--rise': '20px' }}>
        <header className={styles.formHead}>
          <span className={styles.formTitle}>{t.formCardTitle.toLowerCase()}</span>
          <Chip dot="live">delivered by email</Chip>
        </header>

        {sent ? (
          <div className={styles.sent}>
            <span className={styles.sentMark} aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 17.5 12.5 25 27 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h2>It is on its way</h2>
            <p>I read everything that comes through here, and I answer.</p>
            <Button variant="line" onClick={() => setSent(false)}>Write another</Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className={styles.formBody}>
            <div className={styles.pair}>
              <Field id="name" label="name" error={touched.name && errors.name}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={change}
                  onBlur={blur}
                  aria-invalid={Boolean(touched.name && errors.name)}
                  aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
                />
              </Field>

              <Field id="email" label="email" error={touched.email && errors.email}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={change}
                  onBlur={blur}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                />
              </Field>
            </div>

            <Field id="message" label="message" error={touched.message && errors.message}>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={change}
                onBlur={blur}
                aria-invalid={Boolean(touched.message && errors.message)}
                aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
              />
            </Field>

            <Button type="submit" variant="fill" size="lg" disabled={sending} full arrow>
              {sending ? 'Sending' : 'Send it'}
            </Button>
          </form>
        )}
      </Slab>
    </div>
  );
};

export default Connect;
