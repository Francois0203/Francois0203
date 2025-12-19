import React, { useEffect, useRef, useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaLinkedin, FaGithub, FaInstagram, FaOrcid, FaHeart } from 'react-icons/fa';
import styles from './Contact.module.css';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Create magnetic particle effect on hover
  const [magnetPos, setMagnetPos] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnetPos({ x, y });
  };

  // Spawn energy particles around contact cards
  useEffect(() => {
    let mounted = true;
    let timeout;

    const spawnEnergyParticle = () => {
      if (!mounted || !containerRef.current) return;

      const particle = document.createElement('div');
      particle.className = styles.energyParticle;
      
      const x = 20 + Math.random() * 60;
      const y = 20 + Math.random() * 60;
      const size = 3 + Math.random() * 6;
      const duration = 2 + Math.random() * 3;
      
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty('--duration', `${duration}s`);
      
      containerRef.current.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) particle.remove();
      }, duration * 1000);

      timeout = setTimeout(spawnEnergyParticle, 400 + Math.random() * 600);
    };

    timeout = setTimeout(spawnEnergyParticle, 1000);

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const contactMethods = [
    {
      icon: <MdEmail size={32} />,
      title: 'Email',
      value: 'francoismeiring0203@gmail.com',
      link: 'mailto:francoismeiring0203@gmail.com',
      color: 'var(--accent-1)'
    },
    {
      icon: <MdPhone size={32} />,
      title: 'Phone',
      value: '+27 65 131 0546',
      link: 'tel:+27651310546',
      color: 'var(--accent-2)'
    },
    {
      icon: <MdLocationOn size={32} />,
      title: 'Location',
      value: 'Irene, Centurion, South Africa',
      link: null,
      color: 'var(--accent-3)'
    }
  ];

  const socialLinks = [
    {
      icon: <FaLinkedin size={28} />,
      name: 'LinkedIn',
      username: 'francois-meiring',
      link: 'https://www.linkedin.com/in/francois-meiring',
      color: '#0077B5'
    },
    {
      icon: <FaGithub size={28} />,
      name: 'GitHub',
      username: 'Francois0203',
      link: 'https://github.com/Francois0203',
      color: '#333'
    },
    {
      icon: <FaInstagram size={28} />,
      name: 'Instagram',
      username: '@francois0203',
      link: 'https://www.instagram.com/francois0203/',
      color: '#E4405F'
    },
    {
      icon: <FaOrcid size={28} />,
      name: 'ORCID',
      username: '0009-0004-7605-0618',
      link: 'https://orcid.org/0009-0004-7605-0618',
      color: '#A6CE39'
    }
  ];

  return (
    <div 
      ref={containerRef} 
      className={styles.contactWrapper}
      onMouseMove={handleMouseMove}
    >
      {/* Animated background */}
      <div className={styles.magneticField} style={{
        background: `radial-gradient(circle at ${magnetPos.x}% ${magnetPos.y}%, var(--accent-1-background) 0%, transparent 50%)`
      }} />

      {/* DNA Helix */}
      <div className={styles.helixContainer}>
        <div className={styles.helixStrand}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.helixDot} style={{ '--index': i }} />
          ))}
        </div>
        <div className={styles.helixStrand} style={{ '--delay': '1s' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={styles.helixDot} style={{ '--index': i }} />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.helixBridge} style={{ '--bridge-index': i }} />
        ))}
      </div>
      
      <div className={styles.circuitLines}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: 'var(--accent-1)', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: 'var(--accent-2)', stopOpacity: 0.1}} />
            </linearGradient>
          </defs>
          <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="url(#lineGradient)" strokeWidth="2" className={styles.circuitLine} />
          <line x1="90%" y1="20%" x2="90%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2" className={styles.circuitLine} style={{animationDelay: '0.5s'}} />
          <line x1="90%" y1="80%" x2="10%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2" className={styles.circuitLine} style={{animationDelay: '1s'}} />
          <line x1="10%" y1="80%" x2="10%" y2="20%" stroke="url(#lineGradient)" strokeWidth="2" className={styles.circuitLine} style={{animationDelay: '1.5s'}} />
          <circle cx="10%" cy="20%" r="4" fill="var(--accent-1)" className={styles.circuitNode} />
          <circle cx="90%" cy="20%" r="4" fill="var(--accent-2)" className={styles.circuitNode} style={{animationDelay: '0.5s'}} />
          <circle cx="90%" cy="80%" r="4" fill="var(--accent-3)" className={styles.circuitNode} style={{animationDelay: '1s'}} />
          <circle cx="10%" cy="80%" r="4" fill="var(--accent-1)" className={styles.circuitNode} style={{animationDelay: '1.5s'}} />
        </svg>
      </div>

      <div className={`${styles.contentContainer} ${isVisible ? styles.visible : ''}`}>
        {/* Header */}
        <div className={styles.headerSection}>
          <h1 className={styles.mainTitle}>Get in Touch</h1>
          <p className={styles.subtitle}>
            Let's collaborate and bring your ideas to life
          </p>
        </div>

        {/* PROMINENT Support Section - Moved to Top */}
        <div className={styles.supportBanner}>
          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>
              <FaHeart size={48} />
            </div>
            <div className={styles.supportContent}>
              <h2 className={styles.supportTitle}>Support My Academic Journey</h2>
              <p className={styles.supportText}>
                Your contributions help fund my MSc Computer Science studies and research pursuits. 
                Every donation makes a meaningful difference in advancing my academic and professional development.
              </p>
            </div>
            <a 
              href="https://pos.snapscan.io/qr/JOkZ6v6j" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.supportButton}
            >
              <FaHeart size={20} />
              <span>Donate via SnapScan</span>
            </a>
          </div>
        </div>

        {/* Contact Methods */}
        <div className={styles.contactSection}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <div className={styles.contactGrid}>
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`${styles.contactCard} ${hoveredCard === index ? styles.hovered : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {method.link ? (
                  <a href={method.link} className={styles.cardContent}>
                    <div className={styles.cardIcon}>
                      {method.icon}
                    </div>
                    <h3 className={styles.cardTitle}>{method.title}</h3>
                    <p className={styles.cardValue}>{method.value}</p>
                  </a>
                ) : (
                  <div className={styles.cardContent}>
                    <div className={styles.cardIcon}>
                      {method.icon}
                    </div>
                    <h3 className={styles.cardTitle}>{method.title}</h3>
                    <p className={styles.cardValue}>{method.value}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className={styles.socialSection}>
          <h2 className={styles.sectionTitle}>Connect With Me</h2>
          <div className={styles.socialGrid}>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialCard}
              >
                <div className={styles.socialIcon}>
                  {social.icon}
                </div>
                <div className={styles.socialInfo}>
                  <h4 className={styles.socialName}>{social.name}</h4>
                  <p className={styles.socialUsername}>{social.username}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;