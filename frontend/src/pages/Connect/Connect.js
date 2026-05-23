import { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaGlobe, FaFacebook, FaHeart } from 'react-icons/fa';
import { SiOrcid, SiHackerrank, SiCodewars } from 'react-icons/si';
import { MdArrowOutward } from 'react-icons/md';
import { useToast } from '../../components';
import { submitContactForm, getDonation, getSocial } from '../../firebase/firestore';
import styles from './Connect.module.css';

const EMPTY_FORM    = { name: '', email: '', message: '' };
const EMPTY_ERRORS  = { name: '',  email: '',  message: ''  };
const EMPTY_TOUCHED = { name: false, email: false, message: false };

const SOCIAL_ICONS = {
  github:     FaGithub,
  linkedin:   FaLinkedin,
  twitter:    FaTwitter,
  x:          FaTwitter,
  instagram:  FaInstagram,
  youtube:    FaYoutube,
  email:      FaEnvelope,
  facebook:   FaFacebook,
  orcid:      SiOrcid,
  hackerrank: SiHackerrank,
  codewars:   SiCodewars,
};

const getSocialIcon = (key = '') => SOCIAL_ICONS[(key || '').toLowerCase()] ?? FaGlobe;

const validate = ({ name, email, message }) => ({
  name:    !name.trim()    ? 'Name is required'              : '',
  email:   !email.trim()   ? 'Email is required'
         : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                           ? 'Enter a valid email address'   : '',
  message: !message.trim() ? 'Message is required'           : '',
});

const SkeletonSocialCard = () => (
  <div className={styles.card}>
    <div className={`${styles.skeleton} ${styles.skeletonHeading}`} />
    {[0, 1, 2].map(i => (
      <div key={i} className={styles.skeletonRow}>
        <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
        <div className={`${styles.skeleton} ${styles.skeletonLabel}`} />
      </div>
    ))}
  </div>
);

const Connect = () => {
  const { showToast } = useToast();
  const [form,       setForm      ] = useState(EMPTY_FORM);
  const [errors,     setErrors    ] = useState(EMPTY_ERRORS);
  const [touched,    setTouched   ] = useState(EMPTY_TOUCHED);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted ] = useState(false);
  const [donation,   setDonation  ] = useState(undefined);
  const [social,     setSocial    ] = useState(null);

  useEffect(() => {
    getDonation()
      .then(d  => setDonation(d))
      .catch(() => setDonation(null));
    getSocial()
      .then(d  => setSocial(d ?? []))
      .catch(() => setSocial([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate({ ...form, [name]: value })[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(form)[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      setTouched({ name: true, email: true, message: true });
      return;
    }
    setSubmitting(true);
    try {
      await submitContactForm(form);
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setErrors(EMPTY_ERRORS);
      setTouched(EMPTY_TOUCHED);
      showToast('success', 'Message sent', "Thanks — I'll get back to you soon.");
    } catch (err) {
      console.error('[Connect] submitContactForm failed:', err?.code, err?.message, err);
      showToast('error', 'Failed to send', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDonation = () =>
    window.open(donation.link, '_blank', 'noopener,noreferrer');

  const showSocialCol = social === null || (Array.isArray(social) && social.length > 0);
  const showRightCol  = donation?.enabled || showSocialCol;

  return (
    <section className={styles.page}>

      <div className={styles.container}>

        <header className={styles.header}>
          <p className={styles.chapterEyebrow}>
            <span className={styles.chapterMark}>Chapter III</span>
            <span className={styles.chapterDash} aria-hidden="true">—</span>
            <span className={styles.chapterName}>A Letter</span>
          </p>
          <h1 className={styles.heading}>Write to me</h1>
          <p>Have a question, an opportunity, or just want to say hello? Take a seat and write a line.</p>
        </header>

        <div className={`${styles.grid} ${!showRightCol ? styles.gridSingle : ''}`}>

          {/* ── Contact form ─────────────────────────────────────────────── */}
          <div className={`${styles.card} ${styles.formCard}`}>
            {submitted ? (
              <div className={styles.success}>
                <h2>Message sent</h2>
                <p>Thanks for reaching out. I&rsquo;ll get back to you soon.</p>
                <button type="button" onClick={() => setSubmitted(false)}>
                  Send another
                </button>
              </div>
            ) : (
              <>
                <h2>Send a Message</h2>
                <form className={styles.form} onSubmit={handleSubmit} noValidate>

                  <div className={styles.field}>
                    <label htmlFor="name">Name</label>
                    <input
                      id="name" name="name" type="text"
                      value={form.name}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="Your name" autoComplete="name" required
                      className={touched.name && errors.name ? styles.inputError : ''}
                    />
                    {touched.name && errors.name && (
                      <span className={styles.fieldError}>{errors.name}</span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email" name="email" type="email"
                      value={form.email}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="your@email.com" autoComplete="email" required
                      className={touched.email && errors.email ? styles.inputError : ''}
                    />
                    {touched.email && errors.email && (
                      <span className={styles.fieldError}>{errors.email}</span>
                    )}
                  </div>

                  <div className={`${styles.field} ${styles.fieldGrow}`}>
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message" name="message"
                      value={form.message}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="What's on your mind?" rows={4} required
                      className={touched.message && errors.message ? styles.inputError : ''}
                    />
                    {touched.message && errors.message && (
                      <span className={styles.fieldError}>{errors.message}</span>
                    )}
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Send Message'}
                    </button>
                  </div>

                </form>
              </>
            )}
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          {showRightCol && (
            <div className={styles.rightCol}>

              {/* Support pill */}
              {donation?.enabled && (
                <div className={styles.supportPillOuter}>
                  <div className={styles.supportPillInner}>
                    <button
                      type="button"
                      className={styles.supportPillBtn}
                      onClick={openDonation}
                    >
                      <FaHeart aria-hidden="true" />
                      Support
                    </button>
                  </div>
                </div>
              )}

              {/* Social links */}
              {social === null ? (
                <SkeletonSocialCard />
              ) : (
                <div className={styles.card}>
                  <h2>Find Me Online</h2>
                  <ul className={styles.socialList}>
                    {social.map(({ key, url, platform }, i) => {
                      if (!url) return null;
                      const Icon = getSocialIcon(key);
                      const display = platform || (key ? key.charAt(0).toUpperCase() + key.slice(1) : '');
                      return (
                        <li key={key ?? i}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                          >
                            <span className={styles.socialIcon} aria-hidden="true">
                              <Icon />
                            </span>
                            <span className={styles.socialName}>{display}</span>
                            <MdArrowOutward className={styles.socialArrow} aria-hidden="true" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Connect;
