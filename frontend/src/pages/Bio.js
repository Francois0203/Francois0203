import React, { useEffect, useRef } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdWorkOutline, MdSchool, MdCode, MdFavorite } from 'react-icons/md';
import { FaLinkedin, FaInstagram, FaGithub, FaOrcid, FaAward } from 'react-icons/fa';
import styles from './Bio.module.css';
import ProfileImg from '../Images/Profile.jpeg';
import { shouldReduceAnimations, getOptimalParticleCount, getOptimalInterval } from '../utils/deviceUtils';

const Bio = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = useRef(null);
  const reduceAnimations = useRef(shouldReduceAnimations());
  
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
    }, 1200);
  };

  // Spawn subtle water particles using direct DOM manipulation (optimized for mobile)
  useEffect(() => {
    // Skip or reduce water particles on mobile devices
    if (reduceAnimations.current) return;

    let mounted = true;
    let schedulerTimeout = null;
    const activeParticlesRef = { current: 0 };
    const maxParticles = getOptimalParticleCount(4, 2); // Reduced from 4 to 2 on mobile
    const removalTimers = [];

    const spawnParticle = () => {
      if (!mounted || !containerRef.current) return;
      if (activeParticlesRef.current >= maxParticles) {
        schedulerTimeout = setTimeout(spawnParticle, getOptimalInterval(2000) + Math.random() * 3000);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const duration = 3 + Math.random() * 2;

      activeParticlesRef.current += 1;

      const particleEl = document.createElement('div');
      particleEl.className = styles.waterParticle;
      particleEl.style.left = `${x}px`;
      particleEl.style.top = `${y}px`;
      particleEl.style.setProperty('--duration', `${duration}s`);
      containerRef.current.appendChild(particleEl);

      const removeTimer = setTimeout(() => {
        try { particleEl.remove(); } catch (e) {}
        activeParticlesRef.current = Math.max(0, activeParticlesRef.current - 1);
        const idx = removalTimers.indexOf(removeTimer);
        if (idx !== -1) removalTimers.splice(idx, 1);
      }, duration * 1000 + 100);

      removalTimers.push(removeTimer);

      const nextDelay = getOptimalInterval(2500) + Math.random() * 3500;
      schedulerTimeout = setTimeout(spawnParticle, nextDelay);
    };

    schedulerTimeout = setTimeout(spawnParticle, 2000);

    return () => {
      mounted = false;
      if (schedulerTimeout) clearTimeout(schedulerTimeout);
      removalTimers.forEach(t => clearTimeout(t));
    };
  }, []);

  const experiences = [
    {
      title: "Full Stack Developer",
      company: "Aquatico Scientific",
      location: "Route 21 Business Park, Centurion",
      period: "2024 - Present",
      description: "Leading the complete ground-up rebuild of the company's enterprise system architecture. Architecting and developing a comprehensive full-stack solution using React for the frontend and Node.js for the backend, deployed on production servers using Nginx and orchestrated with Kubernetes. The system encompasses multiple integrated modules including laboratory information management, project coordination, and business operations management."
    },
    {
      title: "Shop Assistant",
      company: "Western Rackets",
      period: "During Matric Year",
      description: "Part-time retail position focused on customer service and sales, developing interpersonal communication skills and professional workplace etiquette."
    },
    {
      title: "Waiter",
      company: "Bean Tree, Krugersdorp",
      period: "During Matric Year",
      description: "Food service position emphasizing customer satisfaction, multitasking, and effective communication in a fast-paced environment."
    }
  ];

  const education = [
    {
      degree: "MSc. Computer Science",
      institution: "North-West University, Potchefstroom",
      period: "2026 - Present",
      details: "Research-focused master's degree with emphasis on astronomical data processing and distributed computing systems."
    },
    {
      degree: "BSc. Hons. Computer Science",
      institution: "North-West University, Potchefstroom",
      period: "2024",
      details: "Honours degree specializing in advanced software engineering and computational research methodologies."
    },
    {
      degree: "BSc. Computer Science & Statistics",
      institution: "North-West University, Potchefstroom",
      period: "2021 - 2023",
      details: "Dual-major undergraduate degree combining computational theory with statistical analysis and data science fundamentals."
    },
    {
      degree: "National Senior Certificate (Matric)",
      institution: "Hoërskool Noordheuwel",
      period: "Completed",
      details: "Subjects: Physics, Afrikaans Home Language, English First Additional Language, Mathematics, Information Technology, Computer Applications Technology."
    }
  ];

  const skills = {
    "Programming Languages": ["Python", "JavaScript", "R", "HTML/CSS", "SAS"],
    "Frameworks & Technologies": ["React", "Node.js", "Docker", "Kubernetes", "Nginx", "SQL", "PostgreSQL"],
    "Professional Skills": ["Team Leadership", "Project Management", "Full-Stack Development", "System Architecture"]
  };

  const hobbies = ["Gym", "Squash", "Guitar", "8 Ball Pool", "Hiking", "Personal Projects", "Web Development"];

  return (
    <div ref={containerRef} className={styles.pageWrapper} onClick={handleClick}>
      {/* Ripple and water particle visuals are created directly in the DOM to avoid React re-renders */}

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
              <span>Driver's License: Code B</span>
            </div>
            <div className={styles.infoItem}>
              <MdWorkOutline size={18} />
              <span>Male</span>
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
                <h2>Professional Experience</h2>
              </div>
              <div className={styles.sectionContent}>
                {experiences.map((exp, index) => (
                  <div key={index} className={styles.experienceItem}>
                    <div className={styles.experienceHeader}>
                      <h3>{exp.title}</h3>
                      <span className={styles.period}>{exp.period}</span>
                    </div>
                    <p className={styles.company}>{exp.company}{exp.location && ` • ${exp.location}`}</p>
                    <p className={styles.description}>{exp.description}</p>
                  </div>
                ))}
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
              <p><strong>Languages:</strong> Afrikaans, English</p>
              <p><strong>Faith:</strong> Christian</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bio;