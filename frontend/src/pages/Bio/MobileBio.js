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
import styles     from './MobileBio.module.css';
import ProfileImg from '../../Images/Profile.jpeg';
import { CursorGlowButton } from '../../components';

const TECH_ICON_MAP = {
  FaReact, FaPython, FaJs, FaNodeJs, FaDocker, FaGitAlt,
  FaHtml5, FaCss3Alt, FaLinux, FaDatabase, FaServer,
  SiPostgresql, SiKubernetes, SiNginx, SiR,
};

const SOCIAL_ICON_MAP = {
  FaLinkedin, FaGithub, FaInstagram, FaOrcid, SiHackerrank, FaCode,
};

const useReveal = (threshold = 0.06) => {
  const ref     = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold, rootMargin: '0px 0px -20px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const SectionHeader = ({ icon, title }) => (
  <div className={styles.sectionHeader}>
    {icon && <span className={styles.sectionIcon} aria-hidden="true">{icon}</span>}
    <h2 className={styles.sectionTitle}>{title}</h2>
    <div className={styles.sectionRule} aria-hidden="true" />
  </div>
);

const MobileBio = () => {
  const navigate = useNavigate();
  const [profileVisible, setProfileVisible] = useState(false);
  const [expRef,    expVisible]    = useReveal();
  const [eduRef,    eduVisible]    = useReveal();
  const [skillsRef, skillsVisible] = useReveal();

  useEffect(() => {
    const t = setTimeout(() => setProfileVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.blobField} aria-hidden="true">
        <div className={`${styles.ambientOrb} ${styles.orb1}`} />
        <div className={`${styles.ambientOrb} ${styles.orb2}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.glassCard}>
          <div className={styles.page}>

            {/* ── PROFILE ─────────────────────────────────────────────────────── */}
            <section className={`${styles.profileSection} ${profileVisible ? styles.revealed : ''}`}>

              {/* Profile card with accent hero area at top */}
              <div className={styles.profileCard}>

                {/* Hero zone — accent gradient + image + name */}
                <div className={styles.heroZone}>
                  <div className={styles.imageRing}>
                    <img
                      src={ProfileImg}
                      alt={bioData.personalInfo.name}
                      className={styles.profileImage}
                    />
                  </div>
                  <div className={styles.heroText}>
                    <h1 className={styles.name}>{bioData.personalInfo.name}</h1>
                    <p className={styles.profileTitle}>{bioData.personalInfo.title}</p>
                  </div>
                </div>

                {/* Body zone — summary, contact, meta, actions */}
                <div className={styles.bodyZone}>
                  {bioData.summary && (
                    <p className={styles.summary}>{bioData.summary}</p>
                  )}

                  <div className={styles.divider} />

                  <div className={styles.contactList}>
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

                  <div className={styles.divider} />

                  {/* Meta pills */}
                  <div className={styles.metaRow}>
                    {bioData.personalInfo.languages.map((lang) => (
                      <span key={lang} className={styles.metaPill}>{lang}</span>
                    ))}
                    <span className={styles.metaPill}>{bioData.personalInfo.driversLicense}</span>
                    <span className={styles.metaPill}>{bioData.personalInfo.faith}</span>
                    <span className={styles.metaPill}>{bioData.personalInfo.gender}</span>
                  </div>

                  <div className={styles.divider} />

                  {/* Social links */}
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
            </section>

            {/* ── EXPERIENCE ──────────────────────────────────────────────────── */}
            <section
              ref={expRef}
              className={`${styles.section} ${expVisible ? styles.revealed : ''}`}
            >
              <SectionHeader icon={<MdWorkOutline />} title="Experience" />
              <div className={styles.timeline}>
                {bioData.experiences.map((exp, i) => (
                  <div
                    key={i}
                    className={styles.timelineItem}
                    style={{ '--item-delay': `${i * 80}ms` }}
                  >
                    <div className={styles.timelineDot} aria-hidden="true" />
                    <div className={styles.timelineCard}>
                      <span className={styles.periodBadge}>{exp.period}</span>
                      <h3 className={styles.timelineTitle}>{exp.title}</h3>
                      <p className={styles.timelineCompany}>{exp.company}</p>
                      {exp.location && (
                        <p className={styles.timelineLocation}>{exp.location}</p>
                      )}
                      <p className={styles.timelineDesc}>{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── EDUCATION ───────────────────────────────────────────────────── */}
            <section
              ref={eduRef}
              className={`${styles.section} ${eduVisible ? styles.revealed : ''}`}
            >
              <SectionHeader icon={<MdSchool />} title="Education" />
              <div className={styles.eduList}>
                {bioData.education.map((edu, i) => (
                  <div
                    key={i}
                    className={styles.eduCard}
                    style={{ '--item-delay': `${i * 80}ms` }}
                  >
                    <span className={styles.eduPeriod}>{edu.period}</span>
                    <h3 className={styles.eduDegree}>{edu.degree}</h3>
                    <p className={styles.eduInstitution}>{edu.institution}</p>
                    <p className={styles.eduDetails}>{edu.details}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SKILLS & TECHNOLOGIES ────────────────────────────────────────── */}
            <section
              ref={skillsRef}
              className={`${styles.section} ${skillsVisible ? styles.revealed : ''}`}
            >
              <SectionHeader icon={<MdCode />} title="Skills" />
              <div className={styles.skillsStack}>
                {Object.entries(bioData.skills).map(([category, items], i) => (
                  <div
                    key={category}
                    className={styles.skillCard}
                    style={{ '--item-delay': `${i * 80}ms` }}
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

              <div className={styles.techDivider} aria-hidden="true" />

              <div className={styles.techMarqueeWrapper} aria-label="Technical skills">
                <div className={styles.techTrack}>
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

export default MobileBio;
