import React, { useEffect, useRef } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdWorkOutline, MdSchool, MdCode, MdFavorite } from 'react-icons/md';
import { FaLinkedin, FaInstagram, FaGithub, FaOrcid, FaAward } from 'react-icons/fa';
import styles from './Bio.module.css';
import ProfileImg from '../Images/Profile.jpeg';

const Bio = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Create ripple directly in DOM to avoid frequent React state updates
  const lastRippleRef = useRef(0);
  const handleClick = (e) => {
    // throttle rapid clicks
    const now = Date.now();
    if (now - lastRippleRef.current < 80) return;
    lastRippleRef.current = now;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rippleEl = document.createElement('div');
    rippleEl.className = styles.ripple;
    rippleEl.style.left = `${x}px`;
    rippleEl.style.top = `${y}px`;
    containerRef.current.appendChild(rippleEl);
    const t = setTimeout(() => {
      rippleEl.remove();
      clearTimeout(t);
    }, 900);
  };

  // Spawn raindrops using direct DOM manipulation (no React state)
  useEffect(() => {
    let mounted = true;
    let schedulerTimeout = null;
    const activeDropsRef = { current: 0 };
    const maxDrops = 6; // limit concurrently animated drops
    const removalTimers = [];

    const spawnDrop = () => {
      if (!mounted || !containerRef.current) return;
      // enforce max concurrent drops
      if (activeDropsRef.current >= maxDrops) {
        // schedule next attempt later
        schedulerTimeout = setTimeout(spawnDrop, 400 + Math.random() * 800);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const landingY = rect.height * (0.55 + Math.random() * 0.4);
      const duration = 0.6 + Math.random() * 0.9;

      activeDropsRef.current += 1;

      const dropEl = document.createElement('div');
      dropEl.className = styles.raindrop;
      dropEl.style.left = `${x}px`;
      dropEl.style.setProperty('--fall-distance', `${landingY}px`);
      dropEl.style.setProperty('--duration', `${duration}s`);
      containerRef.current.appendChild(dropEl);

      // Remove drop after its animation + small buffer and create ripple
      const removeTimer = setTimeout(() => {
        try { dropEl.remove(); } catch (e) {}
        // create small ripple on landing
        const rippleEl = document.createElement('div');
        rippleEl.className = styles.ripple;
        rippleEl.style.left = `${x}px`;
        rippleEl.style.top = `${landingY}px`;
        containerRef.current.appendChild(rippleEl);
        const rTimer = setTimeout(() => { try { rippleEl.remove(); } catch (e) {} }, 900);
        removalTimers.push(rTimer);

        activeDropsRef.current = Math.max(0, activeDropsRef.current - 1);
        // clear this timer
        const idx = removalTimers.indexOf(removeTimer);
        if (idx !== -1) removalTimers.splice(idx, 1);
      }, duration * 1000 + 40);

      removalTimers.push(removeTimer);

      const nextDelay = 500 + Math.random() * 1000;
      schedulerTimeout = setTimeout(spawnDrop, nextDelay);
    };

    schedulerTimeout = setTimeout(spawnDrop, 600);

    return () => {
      mounted = false;
      if (schedulerTimeout) clearTimeout(schedulerTimeout);
      removalTimers.forEach(t => clearTimeout(t));
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
      {/* Ripple and raindrop visuals are created directly in the DOM to avoid React re-renders */}

      {/* Background decoration */}
      <div className={styles.bgDecoration} />

      <div className={`${styles.bioContainer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.glassContainer}>
          <div className={styles.photoSection}>
            <div className={styles.photoPlaceholder}>
              <img
                src={ProfileImg}
                alt="Profile"
                loading="lazy"
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
              <FaOrcid size={20} />
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