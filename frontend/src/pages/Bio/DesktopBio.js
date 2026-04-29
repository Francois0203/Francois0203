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

import styles           from './DesktopBio.module.css';
import ProfileImg       from '../../Images/Profile.jpeg';
import { CursorGlowButton } from '../../components';

const bioData = {
  summary: 'Full-stack developer and computer scientist with a strong foundation in software engineering, distributed systems, and modern web technologies. Currently pursuing an MSc in Computer Science at North-West University while contributing to real-world enterprise software. I care deeply about building things that are technically robust and genuinely well-crafted — from system architecture to polished user interfaces. Outside of work, you\'ll find me at the gym, on the squash court, or working through a guitar piece.',
  personalInfo: {
    name: 'Francois Meiring',
    title: 'Junior Software Developer',
    dateOfBirth: '2 March 2002',
    location: 'Irene, Centurion',
    driversLicense: 'Code B',
    gender: 'Male',
    languages: ['Afrikaans', 'English'],
    faith: 'Christian',
  },
  contact: {
    email: 'francoismeiring0203@gmail.com',
    phone: '+27 65 131 0546',
  },
  socialLinks: [
    { platform: 'LinkedIn',    key: 'linkedin',    url: 'https://www.linkedin.com/in/francois-meiring',       icon: 'FaLinkedin',   color: '#0077B5' },
    { platform: 'GitHub',      key: 'github',      url: 'https://github.com/Francois0203',                    icon: 'FaGithub',     color: '#6e40c9' },
    { platform: 'Instagram',   key: 'instagram',   url: 'https://www.instagram.com/francois0203/',            icon: 'FaInstagram',  color: '#E4405F' },
    { platform: 'ORCID',       key: 'orcid',       url: 'https://orcid.org/0009-0004-7605-0618',              icon: 'FaOrcid',      color: '#A6CE39' },
    { platform: 'HackerRank',  key: 'hackerrank',  url: 'https://www.hackerrank.com/profile/francoismeiring', icon: 'SiHackerrank', color: '#00EA64' },
    { platform: 'Codewars',    key: 'codewars',    url: 'https://www.codewars.com/users/CriminalShrimp',      icon: 'FaCode',       color: '#FF7F50' },
  ],
  experiences: [
    {
      title: 'Junior Software Developer',
      company: 'Shareforce (Pty) Ltd',
      location: '39 Melrose Boulevard, Melrose Arch, Johannesburg',
      period: 'May 2026 - Present',
      description: 'As a Junior Software Developer at Shareforce, I contribute to building and maintaining web applications using Python and Django. My role involves writing clean, efficient code, developing backend features, and supporting the implementation of RESTful APIs. I collaborate with team members to debug issues, improve application performance, and ensure code quality through testing and reviews, while continuously learning and applying best practices in software development.',
    },
    {
      title: 'Full Stack Software Developer',
      company: 'Aquatico Scientific',
      location: 'Route 21 Business Park, Centurion',
      period: 'January 2025 - April 2026',
      description: 'Leading the complete ground-up rebuild of the company\'s enterprise system architecture. Architecting and developing a comprehensive full-stack solution using React for the frontend and Node.js for the backend, deployed on production servers using Nginx and orchestrated with Kubernetes. The system encompasses multiple integrated modules including laboratory information management, project coordination, and business operations management.',
    },
    {
      title: 'Shop Assistant',
      company: 'Western Rackets',
      period: 'During Matric Year',
      description: 'Part-time retail position focused on customer service and sales, developing interpersonal communication skills and professional workplace etiquette.',
    },
    {
      title: 'Waiter',
      company: 'Bean Tree, Krugersdorp',
      period: 'During Matric Year',
      description: 'Food service position emphasizing customer satisfaction, multitasking, and effective communication in a fast-paced environment.',
    },
  ],
  education: [
    { degree: 'MSc. Computer Science',              institution: 'North-West University, Potchefstroom', period: '2026 - Present', details: 'Research-focused master\'s degree with emphasis on astronomical data processing and distributed computing systems.'                                                          },
    { degree: 'BSc. Hons. Computer Science',        institution: 'North-West University, Potchefstroom', period: '2024',           details: 'Honours degree specializing in advanced software engineering and computational research methodologies.'                                                                        },
    { degree: 'BSc. Computer Science & Statistics', institution: 'North-West University, Potchefstroom', period: '2021 - 2023',    details: 'Dual-major undergraduate degree combining computational theory with statistical analysis and data science fundamentals.'                                                       },
    { degree: 'National Senior Certificate (Matric)',institution: 'Hoërskool Noordheuwel',               period: 'Completed',      details: 'Subjects: Physics, Afrikaans Home Language, English First Additional Language, Mathematics, Information Technology, Computer Applications Technology.' },
  ],
  skills: {
    'Programming Languages':       ['Python', 'JavaScript', 'R', 'HTML/CSS', 'SAS'],
    'Frameworks & Technologies':   ['React', 'Node.js', 'Docker', 'Kubernetes', 'Nginx', 'SQL', 'PostgreSQL'],
    'Professional Skills':         ['Team Leadership', 'Project Management', 'Full-Stack Development', 'System Architecture'],
  },
  technicalSkills: [
    { name: 'React',       icon: 'FaReact',      color: '#61DAFB', category: 'Frontend'       },
    { name: 'Python',      icon: 'FaPython',     color: '#3776AB', category: 'Language'       },
    { name: 'JavaScript',  icon: 'FaJs',         color: '#F7DF1E', category: 'Language'       },
    { name: 'Node.js',     icon: 'FaNodeJs',     color: '#339933', category: 'Backend'        },
    { name: 'Docker',      icon: 'FaDocker',     color: '#2496ED', category: 'DevOps'         },
    { name: 'Git',         icon: 'FaGitAlt',     color: '#F05032', category: 'Tools'          },
    { name: 'PostgreSQL',  icon: 'SiPostgresql', color: '#4169E1', category: 'Database'       },
    { name: 'HTML5',       icon: 'FaHtml5',      color: '#E34F26', category: 'Frontend'       },
    { name: 'CSS3',        icon: 'FaCss3Alt',    color: '#1572B6', category: 'Frontend'       },
    { name: 'Kubernetes',  icon: 'SiKubernetes', color: '#326CE5', category: 'DevOps'         },
    { name: 'Linux',       icon: 'FaLinux',      color: '#FCC624', category: 'OS'             },
    { name: 'Nginx',       icon: 'SiNginx',      color: '#009639', category: 'Server'         },
    { name: 'R',           icon: 'SiR',          color: '#276DC3', category: 'Language'       },
    { name: 'Database',    icon: 'FaDatabase',   color: '#FF6B6B', category: 'Database'       },
    { name: 'Server',      icon: 'FaServer',     color: '#4ECDC4', category: 'Infrastructure' },
  ],
};

const TECH_ICON_MAP = {
  FaReact, FaPython, FaJs, FaNodeJs, FaDocker, FaGitAlt,
  FaHtml5, FaCss3Alt, FaLinux, FaDatabase, FaServer,
  SiPostgresql, SiKubernetes, SiNginx, SiR,
};

const SOCIAL_ICON_MAP = {
  FaLinkedin, FaGithub, FaInstagram, FaOrcid, SiHackerrank, FaCode,
};

const useReveal = (threshold = 0.08) => {
  const ref     = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold, rootMargin: '0px 0px -40px 0px' },
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

const DesktopBio = () => {
  const navigate = useNavigate();
  const [expRef,    expVisible]    = useReveal();
  const [eduRef,    eduVisible]    = useReveal();
  const [skillsRef, skillsVisible] = useReveal();

  return (
    <div className={styles.root}>
      <div className={styles.blobField} aria-hidden="true">
        <div className={`${styles.ambientOrb} ${styles.orb1}`} />
        <div className={`${styles.ambientOrb} ${styles.orb2}`} />
      </div>

      <div className={styles.content}>
          <div className={styles.page}>

            {/* ── PROFILE ─────────────────────────────────────────────────────── */}
            <section className={`${styles.profileSection} ${styles.revealed}`}>

              {/* Split-panel card: identity left | info right */}
              <div className={styles.profileCard}>

                {/* LEFT — identity panel */}
                <div className={styles.identityPanel}>
                  <div className={styles.imageRing}>
                    <img
                      src={ProfileImg}
                      alt={bioData.personalInfo.name}
                      className={styles.profileImage}
                    />
                  </div>

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

                {/* RIGHT — info panel */}
                <div className={styles.infoPanel}>
                  <div className={styles.nameBlock}>
                    <h1 className={styles.name}>{bioData.personalInfo.name}</h1>
                    <p className={styles.profileTitle}>{bioData.personalInfo.title}</p>
                  </div>

                  {bioData.summary && (
                    <p className={styles.summary}>{bioData.summary}</p>
                  )}

                  <div className={styles.divider} />

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
                </div>
                {/* META STRIP — full-width bottom row inside the card */}
                <div className={styles.metaStrip}>
                  {bioData.personalInfo.languages.map((lang) => (
                    <span key={lang} className={styles.metaPill}>{lang}</span>
                  ))}
                  <span className={styles.metaPill}>{bioData.personalInfo.driversLicense}</span>
                  <span className={styles.metaPill}>{bioData.personalInfo.faith}</span>
                  <span className={styles.metaPill}>{bioData.personalInfo.gender}</span>
                </div>
              </div>
            </section>

            {/* ── EXPERIENCE ──────────────────────────────────────────────────── */}
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
                          <h3 className={styles.timelineTitle}>{exp.title}</h3>
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

            {/* ── EDUCATION ───────────────────────────────────────────────────── */}
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
              <SectionHeader icon={<MdCode />} title="Skills & Technologies" />
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
  );
};

export default DesktopBio;
