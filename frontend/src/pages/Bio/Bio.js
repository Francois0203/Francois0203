import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdEmail, MdPhone, MdLocationOn, MdCalendarToday,
  MdWorkOutline, MdSchool, MdCode,
} from 'react-icons/md';
import {
  FaLinkedin, FaInstagram, FaGithub, FaOrcid,
  FaReact, FaPython, FaJs, FaNodeJs, FaDocker, FaGitAlt,
  FaHtml5, FaCss3Alt, FaLinux, FaDatabase, FaServer, FaCode,
} from 'react-icons/fa';
import { SiPostgresql, SiKubernetes, SiNginx, SiR, SiHackerrank } from 'react-icons/si';

import bioData    from '../../data/bio.json';
import styles     from './Bio.module.css';
import ProfileImg from '../../Images/Profile.jpeg';
import { CursorGlowButton } from '../../components';
import '../../styles/Theme.css';

/* ============================================================================
 * ICON MAPS
 * ============================================================================ */
const TECH_ICON_MAP = {
  FaReact, FaPython, FaJs, FaNodeJs, FaDocker, FaGitAlt,
  FaHtml5, FaCss3Alt, FaLinux, FaDatabase, FaServer,
  SiPostgresql, SiKubernetes, SiNginx, SiR,
};

const SOCIAL_ICON_MAP = {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaOrcid,
  SiHackerrank,
  FaCode,
};

/* ── Triangle blob definitions ─────────────────────────────────────────────── */
/*
 * Three physics-driven glass triangles drift and rotate continuously.
 * r        – half the CSS width (used for boundary clamping & repulsion)
 * sx/sy    – starting position as fraction of viewport
 * vx/vy    – initial velocity in px/s
 * rotSpeed – rotation speed in degrees/second (negative = counter-clockwise)
 */
const BLOB_DEFS = [
  { cls: ['glassTri', 'tri1'], r: 130, sx: 0.12, sy: 0.60, vx:  -7, vy:   8, rotSpeed: -6.0 },
  { cls: ['glassTri', 'tri2'], r: 150, sx: 0.72, sy: 0.18, vx:   9, vy:  -6, rotSpeed:  7.0 },
  { cls: ['glassTri', 'tri3'], r: 110, sx: 0.50, sy: 0.48, vx:  -9, vy:   5, rotSpeed: -4.5 },
];

/* ============================================================================
 * INTERSECTION-OBSERVER REVEAL HOOK
 * Watches an element; flips `visible` to true once it enters the viewport.
 * Disconnects immediately after — no re-triggers on scroll back.
 * ============================================================================ */
const useReveal = (threshold = 0.08) => {
  const ref     = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, visible];
};

/* ============================================================================
 * SECTION HEADER — shared across all content sections
 * ============================================================================ */
const SectionHeader = ({ icon, title }) => (
  <div className={styles.sectionHeader}>
    {icon && <span className={styles.sectionIcon} aria-hidden="true">{icon}</span>}
    <h2>{title}</h2>
    <div className={styles.sectionRule} aria-hidden="true" />
  </div>
);

/* ============================================================================
 * BIO PAGE
 * ============================================================================ */
const Bio = () => {
  const navigate = useNavigate();

  const [pageVisible, setPageVisible]   = useState(false);
  const blobRefs   = useRef([]);
  const physicsRef = useRef(null);
  const rafRef     = useRef(null);
  const nudgeTimer = useRef(null);
  const mouseRef   = useRef({ x: -1000, y: -1000 });

  // Profile enters on mount; all other sections reveal on scroll
  const [profileVisible, setProfileVisible] = useState(false);
  const [expRef,     expVisible]     = useReveal();
  const [eduRef,     eduVisible]     = useReveal();
  const [skillsRef,  skillsVisible]  = useReveal();

  /* Mount fade-in */
  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* ── Triangle physics ── */
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

  useEffect(() => {
    const t = setTimeout(() => setProfileVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`${styles.root} ${pageVisible ? styles.visible : ''}`}
      onMouseMove={e => { mouseRef.current = { x: e.clientX, y: e.clientY }; }}
    >
      {/* ── Triangle blob field ── */}
      <div className={styles.blobField} aria-hidden="true">
        {/* Ambient colour orbs — CSS-only drift, give the glass triangles colour to refract */}
        <div className={`${styles.ambientOrb} ${styles.orb1}`} />
        <div className={`${styles.ambientOrb} ${styles.orb2}`} />
        <div className={`${styles.ambientOrb} ${styles.orb3}`} />
        {/* Glass triangles — physics-driven */}
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
          <div className={styles.page}>

      {/* ── Profile ───────────────────────────────────────────────────────── */}
      <section className={`${styles.profileSection} ${profileVisible ? styles.revealed : ''}`}>
        <div className={styles.profileCard}>

          {/* Image */}
          <div className={styles.imageCol}>
            <div className={styles.imageRing}>
              <img
                src={ProfileImg}
                alt={bioData.personalInfo.name}
                className={styles.profileImage}
              />
            </div>
          </div>

          {/* Info */}
          <div className={styles.infoCol}>
            <h1>{bioData.personalInfo.name}</h1>
            <p className={styles.profileTitle}>{bioData.personalInfo.title}</p>

            {/* Summary */}
            {bioData.summary && (
              <p className={styles.summary}>{bioData.summary}</p>
            )}

            <div className={styles.divider} />

            {/* Contact grid */}
            <div className={styles.contactGrid}>
              <a href={`mailto:${bioData.contact.email}`} className={styles.contactItem}>
                <MdEmail className={styles.contactIcon} aria-hidden="true" />
                <span>{bioData.contact.email}</span>
              </a>
              <a
                href={`tel:${bioData.contact.phone.replace(/\s/g, '')}`}
                className={styles.contactItem}
              >
                <MdPhone className={styles.contactIcon} aria-hidden="true" />
                <span>{bioData.contact.phone}</span>
              </a>
              <div className={styles.contactItem}>
                <MdLocationOn className={styles.contactIcon} aria-hidden="true" />
                <span>{bioData.personalInfo.location}</span>
              </div>
              <div className={styles.contactItem}>
                <MdCalendarToday className={styles.contactIcon} aria-hidden="true" />
                <span>{bioData.personalInfo.dateOfBirth}</span>
              </div>
            </div>

            {/* Metadata pills */}
            <div className={styles.metaRow}>
              {bioData.personalInfo.languages.map((lang) => (
                <span key={lang} className={styles.metaPill}>{lang}</span>
              ))}
              <span className={styles.metaPill}>{bioData.personalInfo.driversLicense}</span>
              <span className={styles.metaPill}>{bioData.personalInfo.faith}</span>
            </div>

            {/* Social links + CTA */}
            <div className={styles.actionsRow}>
              <div className={styles.socialRow}>
                {bioData.socialLinks.map((social) => {
                  const Icon = SOCIAL_ICON_MAP[social.icon];
                  return (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={social.platform}
                    >
                      {Icon && <Icon aria-hidden="true" />}
                    </a>
                  );
                })}
              </div>
              <CursorGlowButton onClick={() => navigate('/contact')}>
                Get in Touch
              </CursorGlowButton>
            </div>
          </div>

        </div>
      </section>

      {/* ── Experience ────────────────────────────────────────────────────── */}
      <section
        ref={expRef}
        className={`${styles.section} ${expVisible ? styles.revealed : ''}`}
      >
        <SectionHeader icon={<MdWorkOutline />} title="Professional Experience" />
        <div className={styles.timeline}>
          {bioData.experiences.map((exp, i) => (
            <div
              key={i}
              className={styles.timelineItem}
              style={{ '--item-delay': `${i * 90}ms` }}
            >
              <div className={styles.timelineDot} aria-hidden="true" />
              <div className={styles.timelineCard}>
                <div className={styles.timelineTop}>
                  <div className={styles.timelineMeta}>
                    <h3>{exp.title}</h3>
                    <p className={styles.timelineCompany}>{exp.company}</p>
                    {exp.location && (
                      <p className={styles.timelineLocation}>{exp.location}</p>
                    )}
                  </div>
                  <span className={styles.periodBadge}>{exp.period}</span>
                </div>
                <p className={styles.timelineDesc}>{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Education ─────────────────────────────────────────────────────── */}
      <section
        ref={eduRef}
        className={`${styles.section} ${eduVisible ? styles.revealed : ''}`}
      >
        <SectionHeader icon={<MdSchool />} title="Education" />
        <div className={styles.eduGrid}>
          {bioData.education.map((edu, i) => (
            <div
              key={i}
              className={styles.eduCard}
              style={{ '--item-delay': `${i * 90}ms` }}
            >
              <span className={styles.eduPeriod}>{edu.period}</span>
              <h3>{edu.degree}</h3>
              <p className={styles.eduInstitution}>{edu.institution}</p>
              <p className={styles.eduDetails}>{edu.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Skills & Technologies ─────────────────────────────────────────── */}
      <section
        ref={skillsRef}
        className={`${styles.section} ${skillsVisible ? styles.revealed : ''}`}
      >
        <SectionHeader icon={<MdCode />} title="Skills & Technologies" />

        {/* Categorised skill lists */}
        <div className={styles.skillsGrid}>
          {Object.entries(bioData.skills).map(([category, items], i) => (
            <div
              key={category}
              className={styles.skillCard}
              style={{ '--item-delay': `${i * 90}ms` }}
            >
              <h3 className={styles.skillCategory}>{category}</h3>
              <div className={styles.tagRow}>
                {items.map((item) => (
                  <span key={item} className={styles.skillTag}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Projects CTA */}
        <div className={styles.sectionCta}>
          <CursorGlowButton onClick={() => navigate('/projects')}>
            View My Projects
          </CursorGlowButton>
        </div>

        {/* Technical icon grid */}
        <div className={styles.techGrid}>
          {bioData.technicalSkills.map((tech, i) => {
            const Icon = TECH_ICON_MAP[tech.icon];
            return (
              <div
                key={tech.name}
                className={styles.techItem}
                style={{ '--item-delay': `${i * 35}ms` }}
              >
                {Icon && <Icon className={styles.techIcon} aria-hidden="true" />}
                <span className={styles.techName}>{tech.name}</span>
              </div>
            );
          })}
        </div>
      </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Bio;