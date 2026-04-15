import React, { useEffect, useRef, useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart, FaCode } from 'react-icons/fa';
import { SiHackerrank } from 'react-icons/si';

import bioData from '../../data/bio.json';
import styles from './Connect.module.css';
import { MagneticButton } from '../../components';

// ─── ICON MAP ───────────────────────────────────────────────────────────────
const ICON_MAP = {
  MdEmail, MdPhone, MdLocationOn,
  FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart,
  SiHackerrank, FaCode,
};

// ─── BLOB DEFS ──────────────────────────────────────────────────────────────
const BLOB_DEFS = [
  { cls: ['glassTri', 'tri1'], r: 130, sx: 0.12, sy: 0.60, vx:  -7, vy:   8, rotSpeed: -6.0 },
  { cls: ['glassTri', 'tri2'], r: 150, sx: 0.72, sy: 0.18, vx:   9, vy:  -6, rotSpeed:  7.0 },
  { cls: ['glassTri', 'tri3'], r: 110, sx: 0.50, sy: 0.48, vx:  -9, vy:   5, rotSpeed: -4.5 },
];

// ─── REVEAL HOOK ────────────────────────────────────────────────────────────
// Flips `visible` once the element enters the viewport; disconnects after.
const useReveal = (threshold = 0.08) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold, rootMargin: '0px 0px -30px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────────
// Physics-driven connect page with floating glass triangles and reveal animations.
const Connect = () => {
  const [pageVisible, setPageVisible]   = useState(false);
  const [socialRef,   socialVisible]    = useReveal();
  const [donationRef, donationVisible]  = useReveal();
  const [statusRef,   statusVisible]    = useReveal();

  const blobRefs   = useRef([]);
  const physicsRef = useRef(null);
  const rafRef     = useRef(null);
  const nudgeTimer = useRef(null);
  const mouseRef   = useRef({ x: -1000, y: -1000 });

  // Mount fade-in
  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ─── BLOB PHYSICS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const blobScale = vw < 400 ? 0.38 : vw < 600 ? 0.57 : 1.0;

    const blobs = BLOB_DEFS.map((def) => {
      const r    = def.r * blobScale;
      const size = r * 2;
      return {
        x:        Math.max(0, Math.min(vw - size, def.sx * vw)),
        y:        Math.max(0, Math.min(vh - size, def.sy * vh)),
        vx:       def.vx,
        vy:       def.vy,
        r,
        angle:    Math.random() * 360,
        rotSpeed: def.rotSpeed,
      };
    });

    blobs.forEach((b, i) => {
      const el = blobRefs.current[i];
      if (el) el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
    });

    physicsRef.current = { blobs, vw, vh, lastTime: null };

    const tick = (timestamp) => {
      const state = physicsRef.current;
      if (!state) return;
      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
      state.lastTime = timestamp;
      const { blobs: bs } = state;
      const MAX_SPEED = 18;
      const DAMPING   = 0.999;

      bs.forEach(b => {
        b.x     += b.vx       * dt;
        b.y     += b.vy       * dt;
        b.vx    *= DAMPING;
        b.vy    *= DAMPING;
        b.angle += b.rotSpeed * dt;
      });

      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], b = bs[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist    = Math.hypot(dx, dy) || 1;
          const minDist = (a.r + b.r) * 0.80;
          if (dist < minDist) {
            const overlap = (minDist - dist) / dist;
            const fx = dx * overlap * 0.016;
            const fy = dy * overlap * 0.016;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }
      }

      bs.forEach(b => {
        const size     = b.r * 2;
        const softZone = b.r * 0.30;
        const push     = 0.50;
        if (b.x < softZone)              b.vx += push;
        if (b.x > vw - size - softZone)  b.vx -= push;
        if (b.y < softZone)              b.vy += push;
        if (b.y > vh - size - softZone)  b.vy -= push;
        b.x = Math.max(0, Math.min(vw - size, b.x));
        b.y = Math.max(0, Math.min(vh - size, b.y));
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > MAX_SPEED) { b.vx = (b.vx / speed) * MAX_SPEED; b.vy = (b.vy / speed) * MAX_SPEED; }
        if (speed < 2) {
          const angle = Math.random() * Math.PI * 2;
          b.vx += Math.cos(angle) * 4;
          b.vy += Math.sin(angle) * 4;
        }
      });

      const mouse = mouseRef.current;
      bs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (!el) return;
        el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
        el.style.setProperty('--cursor-x', `${mouse.x - b.x}px`);
        el.style.setProperty('--cursor-y', `${mouse.y - b.y}px`);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const scheduleNudge = () => {
      nudgeTimer.current = setTimeout(() => {
        const bs = physicsRef.current?.blobs;
        if (bs) {
          const count = 2 + Math.floor(Math.random() * 2);
          [...Array(bs.length).keys()]
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .forEach(idx => {
              const angle    = Math.random() * Math.PI * 2;
              const strength = 8 + Math.random() * 12;
              bs[idx].vx += Math.cos(angle) * strength;
              bs[idx].vy += Math.sin(angle) * strength;
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
      className={`${styles.root} ${pageVisible ? styles.visible : ''}`}
      onMouseMove={e => { mouseRef.current = { x: e.clientX, y: e.clientY }; }}
    >
      {/* ── Triangle blob field ── */}
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

      {/* ── Page content ── */}
      <div className={styles.content}>
        <div className={styles.glassCard}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <p className={styles.eyebrow}>Let's work together</p>
          <h1>{contactPage.heading.title}</h1>
          <p className={styles.subtitle}>{contactPage.heading.subtitle}</p>
        </header>

        {/* ── Main grid: contact methods + social ── */}
        <div className={styles.mainGrid}>

          {/* Contact methods */}
          <section className={styles.contactSection}>
            <h2 className={styles.sectionLabel}>Direct Contact</h2>
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
                    style={{ '--enter-delay': `${i * 80}ms` }}
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={i}
                    className={`${styles.methodCard} ${method.primary ? styles.primary : ''}`}
                    style={{ '--enter-delay': `${i * 80}ms` }}
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Social links */}
          <section
            ref={socialRef}
            className={`${styles.socialSection} ${socialVisible ? styles.revealed : ''}`}
          >
            <h2 className={styles.sectionLabel}>Social Links</h2>
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
                    style={{ '--brand-color': social.color, '--enter-delay': `${i * 60}ms` }}
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
        </div>

        {/* ── Support studies ── */}
        {contactPage.donation?.enabled && (
          <section
            ref={donationRef}
            className={`${styles.donationSection} ${donationVisible ? styles.revealed : ''}`}
          >
            <div className={styles.donationCard}>
              <div className={styles.donationLeft}>
                <span className={styles.donationIconWrap} aria-hidden="true">
                  <FaHeart />
                </span>
                <div>
                  <h2 className={styles.donationTitle}>{contactPage.donation.title}</h2>
                  <p className={styles.donationMessage}>{contactPage.donation.message}</p>
                </div>
              </div>
              <div className={styles.donationCta}>
                <MagneticButton
                  onClick={() => window.open(contactPage.donation.link, '_blank', 'noopener,noreferrer')}
                >
                  {contactPage.donation.buttonText}
                </MagneticButton>
              </div>
            </div>
          </section>
        )}

        {/* ── Availability status ── */}
        {contactPage.availability && (
          <div
            ref={statusRef}
            className={`${styles.statusBar} ${styles[contactPage.availability.status]} ${statusVisible ? styles.revealed : ''}`}
          >
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>{contactPage.availability.message}</span>
          </div>
        )}

        </div>{/* end glassCard */}
      </div>
    </div>
  );
};

export default Connect;
