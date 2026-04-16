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

// ─── ICON MAPS ─────────────────────────────────────────────────────────────────────
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

// ─── REVEAL HOOK ──────────────────────────────────────────────────────────────────
// Flips `visible` once the element enters the viewport; disconnects after.
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

// ─── SECTION HEADER ───────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div className={styles.sectionHeader}>
    {icon && <span className={styles.sectionIcon} aria-hidden="true">{icon}</span>}
    <h2>{title}</h2>
    <div className={styles.sectionRule} aria-hidden="true" />
  </div>
);

// ─── COMPONENT ───────────────────────────────────────────────────────────────────
const Bio = () => {
  const navigate = useNavigate();

  const [pageVisible, setPageVisible]   = useState(false);

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

  useEffect(() => {
    const t = setTimeout(() => setProfileVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`${styles.root} ${pageVisible ? styles.visible : ''}`}>
      {/* ── Background wash ── */}
      <div className={styles.blobField} aria-hidden="true">
        <div className={`${styles.ambientOrb} ${styles.orb1}`} />
        <div className={`${styles.ambientOrb} ${styles.orb2}`} />
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

              {/* Full-width divider */}
              <div className={styles.techDivider} aria-hidden="true" />

              {/* Technical icon marquee — scrolls right → left continuously */}
              <div className={styles.techMarqueeWrapper} aria-label="Technical skills">
                <div className={styles.techTrack}>
                  {/* Render twice for a seamless infinite loop */}
                  {[...bioData.technicalSkills, ...bioData.technicalSkills].map((tech, i) => {
                    const Icon = TECH_ICON_MAP[tech.icon];
                    return (
                      <div
                        key={`${tech.name}-${i}`}
                        className={styles.techItem}
                        style={{ '--wave-i': i % bioData.technicalSkills.length }}
                        aria-hidden={i >= bioData.technicalSkills.length ? 'true' : undefined}
                      >
                        {Icon && <Icon className={styles.techIcon} aria-hidden="true" />}
                        <span className={styles.techName}>{tech.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects CTA */}
              <div className={styles.sectionCta}>
                <CursorGlowButton onClick={() => navigate('/projects')}>
                  View My Projects
                </CursorGlowButton>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bio;