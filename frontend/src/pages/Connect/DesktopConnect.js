import React, { useEffect, useRef, useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart, FaCode } from 'react-icons/fa';
import { SiHackerrank } from 'react-icons/si';

import bioData from '../../data/bio.json';
import styles  from './DesktopConnect.module.css';
import { MagneticButton } from '../../components';

const ICON_MAP = {
  MdEmail, MdPhone, MdLocationOn,
  FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart,
  SiHackerrank, FaCode,
};

const BLOB_DEFS = [
  { cls: ['glassTri', 'tri1'], r: 130, sx: 0.08, sy: 0.55, vx: -7,  vy:  8, rotSpeed: -6.0 },
  { cls: ['glassTri', 'tri2'], r: 150, sx: 0.75, sy: 0.15, vx:  9,  vy: -6, rotSpeed:  7.0 },
  { cls: ['glassTri', 'tri3'], r: 110, sx: 0.50, sy: 0.50, vx: -9,  vy:  5, rotSpeed: -4.5 },
];

const DesktopConnect = () => {
  const [ready, setReady] = useState(false);

  const blobRefs   = useRef([]);
  const physicsRef = useRef(null);
  const rafRef     = useRef(null);
  const nudgeTimer = useRef(null);
  const mouseRef   = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

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
      });

      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], b = bs[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const min  = (a.r + b.r) * 0.80;
          if (dist < min) {
            const ov = (min - dist) / dist;
            const fx = dx * ov * 0.016, fy = dy * ov * 0.016;
            a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
          }
        }
      }

      bs.forEach(b => {
        const size = b.r * 2, soft = b.r * 0.30;
        if (b.x < soft)             b.vx += 0.5;
        if (b.x > vw - size - soft) b.vx -= 0.5;
        if (b.y < soft)             b.vy += 0.5;
        if (b.y > vh - size - soft) b.vy -= 0.5;
        b.x = Math.max(0, Math.min(vw - size, b.x));
        b.y = Math.max(0, Math.min(vh - size, b.y));
        const spd = Math.hypot(b.vx, b.vy);
        if (spd > 18) { b.vx = b.vx / spd * 18; b.vy = b.vy / spd * 18; }
        if (spd < 2)  {
          const a = Math.random() * Math.PI * 2;
          b.vx += Math.cos(a) * 4; b.vy += Math.sin(a) * 4;
        }
      });

      const m = mouseRef.current;
      bs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (!el) return;
        el.style.transform = `translate(${b.x}px,${b.y}px) rotate(${b.angle}deg)`;
        el.style.setProperty('--cursor-x', `${m.x - b.x}px`);
        el.style.setProperty('--cursor-y', `${m.y - b.y}px`);
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
            .slice(0, 2 + Math.floor(Math.random() * 2))
            .forEach(idx => {
              const a = Math.random() * Math.PI * 2;
              const s = 8 + Math.random() * 12;
              bs[idx].vx += Math.cos(a) * s;
              bs[idx].vy += Math.sin(a) * s;
            });
        }
        scheduleNudge();
      }, 2500 + Math.random() * 3500);
    };
    scheduleNudge();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(nudgeTimer.current);
      physicsRef.current = null;
    };
  }, []);

  const { contactPage, socialLinks } = bioData;

  return (
    <div
      className={`${styles.root} ${ready ? styles.ready : ''}`}
      onMouseMove={e => { mouseRef.current = { x: e.clientX, y: e.clientY }; }}
    >
      {/* Blobs */}
      <div className={styles.blobField} aria-hidden="true">
        <div className={`${styles.ambientOrb} ${styles.orb1}`} />
        <div className={`${styles.ambientOrb} ${styles.orb2}`} />
        <div className={`${styles.ambientOrb} ${styles.orb3}`} />
        {BLOB_DEFS.map((def, i) => (
          <div
            key={i}
            ref={el => { blobRefs.current[i] = el; }}
            className={`${styles[def.cls[0]]} ${styles[def.cls[1]]}`}
          />
        ))}
      </div>

      {/* Page */}
      <div className={styles.content}>
        <div className={styles.layout}>

          {/* LEFT column — intro + contact */}
          <div className={styles.leftCol}>
            <header className={styles.header}>
              <p className={styles.eyebrow}>Let's work together</p>
              <h1 className={styles.heading}>{contactPage.heading.title}</h1>
              <p className={styles.subtitle}>{contactPage.heading.subtitle}</p>
            </header>

            <section className={styles.contactSection} aria-label="Direct contact">
              <p className={styles.sectionLabel}>Direct Contact</p>
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

            {/* Availability status */}
            {contactPage.availability && (
              <div className={`${styles.statusBar} ${styles[contactPage.availability.status]}`}>
                <span className={styles.statusDot} aria-hidden="true" />
                <span className={styles.statusText}>{contactPage.availability.message}</span>
              </div>
            )}
          </div>

          {/* RIGHT column — social + donation */}
          <div className={styles.rightCol}>
            <section className={styles.socialSection} aria-label="Social links">
              <p className={styles.sectionLabel}>Find me on</p>
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

            {contactPage.donation?.enabled && (
              <section className={styles.donationCard} aria-label="Support">
                <span className={styles.donationIcon} aria-hidden="true">
                  <FaHeart />
                </span>
                <div className={styles.donationBody}>
                  <h2 className={styles.donationTitle}>{contactPage.donation.title}</h2>
                  <p className={styles.donationMessage}>{contactPage.donation.message}</p>
                </div>
                <div className={styles.donationCta}>
                  <MagneticButton
                    onClick={() => window.open(contactPage.donation.link, '_blank', 'noopener,noreferrer')}
                  >
                    {contactPage.donation.buttonText}
                  </MagneticButton>
                </div>
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DesktopConnect;
