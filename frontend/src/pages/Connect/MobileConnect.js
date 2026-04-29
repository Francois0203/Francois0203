import React, { useEffect, useRef } from 'react';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart, FaCode } from 'react-icons/fa';
import { SiHackerrank } from 'react-icons/si';

import styles            from './MobileConnect.module.css';
import { MagneticButton } from '../../components';

const contactPage = {
  heading: {
    title: 'Let\'s Connect',
    subtitle: 'Feel free to reach out for collaborations, opportunities, or just to say hello!',
  },
  contactMethods: [
    { type: 'email',    label: 'Email',    value: 'francoismeiring0203@gmail.com', link: 'mailto:francoismeiring0203@gmail.com', icon: 'MdEmail',     primary: true  },
    { type: 'phone',    label: 'Phone',    value: '+27 65 131 0546',               link: 'tel:+27651310546',                     icon: 'MdPhone',     primary: true  },
    { type: 'location', label: 'Location', value: 'Irene, Centurion, South Africa',                                              icon: 'MdLocationOn',primary: false },
  ],
  donation: {
    enabled: true,
    title: 'Support My Studies',
    message: 'If you\'d like to help me continue my education and learning journey, you can donate here. Any support means a lot to me!',
    link: 'https://pos.snapscan.io/qr/JOkZ6v6j',
    buttonText: 'Support My Studies 📚',
  },
  availability: {
    status: 'open',
    message: 'Currently available for freelance projects and part-time opportunities',
  },
};

const socialLinks = [
  { platform: 'LinkedIn',   key: 'linkedin',   url: 'https://www.linkedin.com/in/francois-meiring',       icon: 'FaLinkedin',   color: '#0077B5' },
  { platform: 'GitHub',     key: 'github',     url: 'https://github.com/Francois0203',                    icon: 'FaGithub',     color: '#6e40c9' },
  { platform: 'Instagram',  key: 'instagram',  url: 'https://www.instagram.com/francois0203/',            icon: 'FaInstagram',  color: '#E4405F' },
  { platform: 'ORCID',      key: 'orcid',      url: 'https://orcid.org/0009-0004-7605-0618',              icon: 'FaOrcid',      color: '#A6CE39' },
  { platform: 'HackerRank', key: 'hackerrank', url: 'https://www.hackerrank.com/profile/francoismeiring', icon: 'SiHackerrank', color: '#00EA64' },
  { platform: 'Codewars',   key: 'codewars',   url: 'https://www.codewars.com/users/CriminalShrimp',      icon: 'FaCode',       color: '#FF7F50' },
];

const ICON_MAP = {
  MdEmail, MdPhone, MdLocationOn,
  FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart,
  SiHackerrank, FaCode,
};

const BLOB_DEFS = [
  { cls: ['glassTri', 'tri1'], r: 70,  sx: 0.05, sy: 0.60, vx: -5, vy:  6, rotSpeed: -5.0 },
  { cls: ['glassTri', 'tri2'], r: 85,  sx: 0.72, sy: 0.15, vx:  7, vy: -5, rotSpeed:  6.0 },
  { cls: ['glassTri', 'tri3'], r: 60,  sx: 0.50, sy: 0.45, vx: -7, vy:  4, rotSpeed: -4.0 },
];

const MobileConnect = () => {
  const blobRefs   = useRef([]);
  const physicsRef = useRef(null);
  const rafRef     = useRef(null);
  const nudgeTimer = useRef(null);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const blobs = BLOB_DEFS.map(def => {
      const r    = def.r;
      const size = r * 2;
      return {
        x: Math.max(0, Math.min(vw - size, def.sx * vw)),
        y: Math.max(0, Math.min(vh - size, def.sy * vh)),
        vx: def.vx, vy: def.vy, r,
        angle: Math.random() * 360,
        rotSpeed: def.rotSpeed,
      };
    });

    blobs.forEach((b, i) => {
      const el = blobRefs.current[i];
      if (el) el.style.transform = `translate(${b.x}px,${b.y}px) rotate(${b.angle}deg)`;
    });

    physicsRef.current = { blobs, vw, vh, lastTime: null };

    const tick = ts => {
      const state = physicsRef.current;
      if (!state) return;
      if (!state.lastTime) state.lastTime = ts;
      const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
      state.lastTime = ts;
      const { blobs: bs } = state;

      bs.forEach(b => {
        b.x    += b.vx * dt;
        b.y    += b.vy * dt;
        b.vx   *= 0.999;
        b.vy   *= 0.999;
        b.angle += b.rotSpeed * dt;
        const size = b.r * 2, soft = b.r * 0.30;
        if (b.x < soft)             b.vx += 0.4;
        if (b.x > vw - size - soft) b.vx -= 0.4;
        if (b.y < soft)             b.vy += 0.4;
        if (b.y > vh - size - soft) b.vy -= 0.4;
        b.x = Math.max(0, Math.min(vw - size, b.x));
        b.y = Math.max(0, Math.min(vh - size, b.y));
        const spd = Math.hypot(b.vx, b.vy);
        if (spd > 14) { b.vx = b.vx / spd * 14; b.vy = b.vy / spd * 14; }
        if (spd < 1.5) {
          const a = Math.random() * Math.PI * 2;
          b.vx += Math.cos(a) * 3; b.vy += Math.sin(a) * 3;
        }
      });

      bs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (el) el.style.transform = `translate(${b.x}px,${b.y}px) rotate(${b.angle}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const scheduleNudge = () => {
      nudgeTimer.current = setTimeout(() => {
        const bs = physicsRef.current?.blobs;
        if (bs) {
          [...Array(bs.length).keys()]
            .sort(() => Math.random() - 0.5)
            .slice(0, 2)
            .forEach(idx => {
              const a = Math.random() * Math.PI * 2;
              bs[idx].vx += Math.cos(a) * 7;
              bs[idx].vy += Math.sin(a) * 7;
            });
        }
        scheduleNudge();
      }, 3000 + Math.random() * 4000);
    };
    scheduleNudge();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(nudgeTimer.current);
      physicsRef.current = null;
    };
  }, []);

  return (
    <div className={`${styles.root} ${styles.ready}`}>
      {/* Blobs */}
      <div className={styles.blobField} aria-hidden="true">
        <div className={`${styles.ambientOrb} ${styles.orb1}`} />
        <div className={`${styles.ambientOrb} ${styles.orb2}`} />
        {BLOB_DEFS.map((def, i) => (
          <div
            key={i}
            ref={el => { blobRefs.current[i] = el; }}
            className={`${styles[def.cls[0]]} ${styles[def.cls[1]]}`}
          />
        ))}
      </div>

      {/* Page content */}
      <div className={styles.content}>
        <div className={styles.page}>

          {/* Header */}
          <header className={styles.header}>
            <p className={styles.eyebrow}>Let's work together</p>
            <h1 className={styles.heading}>{contactPage.heading.title}</h1>
            <p className={styles.subtitle}>{contactPage.heading.subtitle}</p>
          </header>

          {/* Contact panel */}
          <section className={styles.contactPanel} aria-label="Direct contact">
            <p className={styles.panelLabel}>Direct Contact</p>
            <div className={styles.contactList}>
              {contactPage.contactMethods.map((method, i) => {
                const Icon = ICON_MAP[method.icon];
                const inner = (
                  <>
                    <span className={styles.methodIcon} aria-hidden="true">
                      {Icon && <Icon />}
                    </span>
                    <span className={styles.methodBody}>
                      <span className={styles.methodLabel}>{method.label}</span>
                      <span className={styles.methodValue}>{method.value}</span>
                    </span>
                  </>
                );
                return method.link ? (
                  <a
                    key={i}
                    href={method.link}
                    className={`${styles.methodCard} ${method.primary ? styles.primary : ''}`}
                    style={{ '--enter-i': i }}
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={i}
                    className={`${styles.methodCard} ${method.primary ? styles.primary : ''}`}
                    style={{ '--enter-i': i }}
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Social panel */}
          <section className={styles.socialPanel} aria-label="Social links">
            <p className={styles.panelLabel}>Find Me Online</p>
            <div className={styles.socialGrid}>
              {socialLinks.map((social, i) => {
                const Icon = ICON_MAP[social.icon];
                return (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialCard}
                    style={{ '--brand-color': social.color, '--enter-i': i }}
                    aria-label={social.platform}
                  >
                    <span className={styles.socialIconWrap} aria-hidden="true">
                      {Icon && <Icon />}
                    </span>
                    <span className={styles.socialName}>{social.platform}</span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Donation */}
          {contactPage.donation?.enabled && (
            <section className={styles.donationCard} aria-label="Support">
              <div className={styles.donationTop}>
                <span className={styles.donationIcon} aria-hidden="true">
                  <FaHeart />
                </span>
                <div className={styles.donationBody}>
                  <h2 className={styles.donationTitle}>{contactPage.donation.title}</h2>
                  <p className={styles.donationMessage}>{contactPage.donation.message}</p>
                </div>
              </div>
              <MagneticButton
                onClick={() => window.open(contactPage.donation.link, '_blank', 'noopener,noreferrer')}
              >
                {contactPage.donation.buttonText}
              </MagneticButton>
            </section>
          )}

          {/* Status */}
          {contactPage.availability && (
            <div className={`${styles.statusBar} ${styles[contactPage.availability.status]}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span className={styles.statusText}>{contactPage.availability.message}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MobileConnect;
