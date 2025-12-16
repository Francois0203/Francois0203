import React, { useEffect, useState, useRef } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdWorkOutline, MdSchool, MdCode, MdFavorite } from 'react-icons/md';
import { FaLinkedin, FaInstagram, FaGithub, FaExternalLinkAlt, FaAward } from 'react-icons/fa';
import styles from './Bio.module.css';
import ProfileImg from '../Images/Profile.jpeg';

const Bio = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [drops, setDrops] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle click - create ripple
  const handleClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  };

  // Spawn raindrops
  useEffect(() => {
    let mounted = true;
    let timeout;

    const spawnDrop = () => {
      if (!mounted || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const landingY = rect.height * (0.55 + Math.random() * 0.4);
      const duration = 0.6 + Math.random() * 0.9;
      const id = Date.now() + Math.random();

      const drop = { id, x, landingY, duration };
      setDrops(prev => [...prev, drop]);

      setTimeout(() => {
        setDrops(prev => prev.filter(d => d.id !== id));
        const ripple = { id: 'r' + id, x, y: landingY };
        setRipples(prev => [...prev, ripple]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, 1000);
      }, duration * 1000 + 40);

      const nextDelay = 300 + Math.random() * 1200;
      timeout = setTimeout(spawnDrop, nextDelay);
    };

    timeout = setTimeout(spawnDrop, 400);

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const experiences = [
    {
      title: "Full Stack Developer",
      company: "Aquatico",
      period: "January 2025 - Present",
      description: "Building comprehensive management systems including Employee Management (leave, HR), Laboratory Information Management (stock, variables, analysis, quotes), Project Management (client registration, resource scheduling), and Reporting Management systems."
    }
  ];

  const education = [
    {
      degree: "MSc. Computer Science",
      institution: "North-West University",
      period: "2026 - Present",
      details: "Developing a Python telescope correlator with Docker deployment for university telescopy site."
    },
    {
      degree: "BSc. Hons. Computer Science",
      institution: "North-West University",
      period: "2024",
      details: "Student Number: 38276909"
    },
    {
      degree: "BSc. Computer Science & Statistics",
      institution: "North-West University",
      period: "2021 - 2023",
      details: "Team lead for telescope software and stock management system projects."
    }
  ];

  const skills = {
    "Programming": ["JavaScript", "Python", "Node.js", "R", "SAS"],
    "Technologies": ["SQL", "Docker", "React"],
    "Soft Skills": ["Team Leadership", "Project Management", "Data Analysis"]
  };

  const hobbies = ["Gym", "Guitar", "8 Ball Pool", "Squash", "Hiking", "Data Analysis", "Personal Projects"];

  return (
    <div ref={containerRef} className={styles.pageWrapper} onClick={handleClick}>
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`
          }}
        />
      ))}

      {/* Raindrops */}
      {drops.map(drop => (
        <div
          key={drop.id}
          className={styles.raindrop}
          style={{
            left: `${drop.x}px`,
            '--fall-distance': `${drop.landingY}px`,
            '--duration': `${drop.duration}s`
          }}
        />
      ))}

      {/* Background decoration */}
      <div className={styles.bgDecoration} />

      <div className={`${styles.bioContainer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.glassContainer}>
          <div className={styles.photoSection}>
            <div className={styles.photoPlaceholder}>
              <img
                src={ProfileImg}
                alt="Profile"
                className={styles.photoImage}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            </div>
            <h1 className={styles.name}>Francois Meiring</h1>
            <p className={styles.title}>Full Stack Developer & Computer Science Researcher</p>
          </div>

          <div className={styles.personalInfo}>
            <div className={styles.infoItem}>
              <MdCalendarToday size={18} />
              <span>2 March 2002</span>
            </div>
            <div className={styles.infoItem}>
              <MdLocationOn size={18} />
              <span>Irene, Centurion</span>
            </div>
            <div className={styles.infoItem}>
              <FaAward size={18} />
              <span>License Code B</span>
            </div>
          </div>

          <div className={styles.contactBar}>
            <a href="mailto:francoismeiring0203@gmail.com" className={styles.contactItem}>
              <MdEmail size={20} />
              <span>francoismeiring0203@gmail.com</span>
            </a>
            <a href="tel:+27651310546" className={styles.contactItem}>
              <MdPhone size={20} />
              <span>+27 65 131 0546</span>
            </a>
          </div>

          <div className={styles.socialLinks}>
            <a href="https://www.linkedin.com/in/francois-meiring" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaLinkedin size={24} />
            </a>
            <a href="https://github.com/Francois0203" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaGithub size={24} />
            </a>
            <a href="https://www.instagram.com/francois0203/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaInstagram size={24} />
            </a>
            <a href="https://orcid.org/0009-0004-7605-0618" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <FaExternalLinkAlt size={20} />
            </a>
          </div>

          <div className={styles.mainContent}>
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <MdWorkOutline size={28} />
                <h2>Experience</h2>
              </div>
              <div className={styles.sectionContent}>
                {experiences.map((exp, index) => (
                  <div key={index} className={styles.experienceItem}>
                    <div className={styles.experienceHeader}>
                      <h3>{exp.title}</h3>
                      <span className={styles.period}>{exp.period}</span>
                    </div>
                    <p className={styles.company}>{exp.company}</p>
                    <p className={styles.description}>{exp.description}</p>
                  </div>
                ))}
                <div className={styles.previousRoles}>
                  <p><strong>Previous Roles:</strong> Shop Assistant at Western Rackets, Waiter (during matric years)</p>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <MdSchool size={28} />
                <h2>Education</h2>
              </div>
              <div className={styles.sectionContent}>
                {education.map((edu, index) => (
                  <div key={index} className={styles.educationItem}>
                    <div className={styles.educationHeader}>
                      <h3>{edu.degree}</h3>
                      <span className={styles.period}>{edu.period}</span>
                    </div>
                    <p className={styles.institution}>{edu.institution}</p>
                    <p className={styles.details}>{edu.details}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <MdCode size={28} />
                <h2>Technical Skills</h2>
              </div>
              <div className={styles.sectionContent}>
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category} className={styles.skillCategory}>
                    <h4>{category}</h4>
                    <div className={styles.skillTags}>
                      {items.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <MdFavorite size={28} />
                <h2>Interests & Hobbies</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.hobbiesGrid}>
                  {hobbies.map((hobby, index) => (
                    <div key={index} className={styles.hobbyItem}>{hobby}</div>
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.additionalInfo}>
              <p><strong>Languages:</strong> English, Afrikaans</p>
              <p><strong>Faith:</strong> Christian</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bio;