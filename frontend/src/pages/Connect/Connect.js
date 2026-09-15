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
import Embers from '../../components/Embers';
import styles from './Connect.module.css';

/*
 * The letter. Heading and real addresses on the left, form on the right.
 *
 * Labels above inputs, errors below, never a placeholder as a label: a
 * placeholder vanishes the moment someone types, which is when they need
 * it. Validation runs on submit, then per change on a touched field.
 */

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
      {/* Draws in on focus. */}
      <span className={styles.underline} aria-hidden="true" />
    </div>
    {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
  </div>
);

const Connect = () => {
  const { showToast } = useToast();
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
      // Take them to the first thing that needs fixing.
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
      showToast('That did not send. Try again, or email me directly.', 'error');
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
      style={{ '--step': '70ms' }}
    >
      <div className={styles.side}>
        <p className={styles.eyebrow} data-rise style={{ '--i': 0 }}>{t.eyebrow}</p>

        <h1 className={styles.title}>
          <span className="mask"><span style={{ '--i': 1 }}>{t.heading}</span></span>
        </h1>

        <p className={styles.lede} data-rise style={{ '--i': 2 }}>{t.intro}</p>

        <dl className={styles.details} data-rise style={{ '--i': 3 }}>
          {loading && <dd className={styles.plain}>Loading</dd>}

          {!loading && contact.email && (
            <>
              <dt>Email</dt>
              <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
            </>
          )}

          {!loading && contact.phone && (
            <>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${String(contact.phone).replace(/\s+/g, '')}`}>{contact.phone}</a>
              </dd>
            </>
          )}

          {!loading && contact.location && (
            <>
              <dt>Based</dt>
              <dd className={styles.plain}>{contact.location}</dd>
            </>
          )}

          {!loading && social.length > 0 && (
            <>
              <dt>{t.socialCardTitle}</dt>
              <dd className={styles.social}>
                {social.map((s, i) => (
                  <a key={s.key ?? i} href={s.url} target="_blank" rel="noopener noreferrer">
                    {/* `platform` is the display name; `key` is the lowercase
                        lookup and only a fallback, or this reads as slugs. */}
                    {s.platform || s.display || s.label || s.key}
                  </a>
                ))}
              </dd>
            </>
          )}
        </dl>
      </div>

      <Slab live className={styles.form} data-rise style={{ '--i': 2 }}>
        {sent ? (
          <div className={styles.sent}>
            <Embers count={18} mode="burst" className={styles.burst} />
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
          <form onSubmit={submit} noValidate>
            <h2 className={styles.formTitle}>{t.formCardTitle}</h2>

            <div className={styles.pair}>
              <Field id="name" label="Name" error={touched.name && errors.name}>
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

              <Field id="email" label="Email" error={touched.email && errors.email}>
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

            <Field id="message" label="Message" error={touched.message && errors.message}>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={change}
                onBlur={blur}
                aria-invalid={Boolean(touched.message && errors.message)}
                aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
              />
            </Field>

            <Button type="submit" variant="fill" size="lg" disabled={sending} full>
              {sending ? 'Sending' : 'Send it'}
            </Button>
          </form>
        )}
      </Slab>
    </div>
  );
};

export default Connect;
