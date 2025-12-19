import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdRocketLaunch, MdArrowForward } from 'react-icons/md';
import styles from './Home.module.css';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const codeMatrixRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Track mouse position for interactive effects
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  // Floating Code Matrix Animation
  useEffect(() => {
    const container = codeMatrixRef.current;
    if (!container) return;

    const codeSymbols = ['<', '>', '{', '}', '[', ']', '(', ')', '/', '\\', ';', ':', '=', '+', '-', '*', '&', '|', '%', '#', '@', '$'];
    const colors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)'];
    let mounted = true;
    const elements = [];

    const createCodeElement = () => {
      if (!mounted || elements.length >= 25) return;

      const el = document.createElement('div');
      el.className = styles.codeSymbol;
      el.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.color = colors[Math.floor(Math.random() * colors.length)];
      
      const duration = 15 + Math.random() * 20;
      el.style.setProperty('--duration', `${duration}s`);
      el.style.setProperty('--delay', `${Math.random() * 5}s`);
      el.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`);
      el.style.setProperty('--ty', `${-50 - Math.random() * 100}px`);
      el.style.setProperty('--tx2', `${(Math.random() - 0.5) * 80}px`);
      el.style.setProperty('--ty2', `${-100 - Math.random() * 100}px`);
      el.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
      
      container.appendChild(el);
      elements.push(el);

      setTimeout(() => {
        if (el.parentNode) el.remove();
        const idx = elements.indexOf(el);
        if (idx !== -1) elements.splice(idx, 1);
      }, duration * 1000);
    };

    // Initial spawn
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createCodeElement(), i * 200);
    }

    // Continuous spawning
    const interval = setInterval(() => {
      if (Math.random() > 0.7) createCodeElement();
    }, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
      elements.forEach(el => el.remove());
    };
  }, []);

  // Click ripple effect
  const lastRippleRef = useRef(0);
  const handleClick = (e) => {
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

  // Spawn raindrops
  useEffect(() => {
    let mounted = true;
    let schedulerTimeout = null;
    const removalTimers = [];

    const spawnRaindrop = () => {
      if (!mounted || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const startX = Math.random() * rect.width;
      const endY = 200 + Math.random() * (rect.height - 200);
      const duration = 800 + Math.random() * 400;

      const dropEl = document.createElement('div');
      dropEl.className = styles.raindrop;
      dropEl.style.left = `${startX}px`;
      dropEl.style.top = `0px`;
      dropEl.style.setProperty('--end-y', `${endY}px`);
      dropEl.style.setProperty('--duration', `${duration}ms`);
      containerRef.current.appendChild(dropEl);

      const rippleTimer = setTimeout(() => {
        const rippleEl = document.createElement('div');
        rippleEl.className = styles.ripple;
        rippleEl.style.left = `${startX}px`;
        rippleEl.style.top = `${endY}px`;
        containerRef.current.appendChild(rippleEl);

        const rippleRemoveTimer = setTimeout(() => {
          try { rippleEl.remove(); } catch (e) {}
        }, 1200);
        removalTimers.push(rippleRemoveTimer);
      }, duration);

      removalTimers.push(rippleTimer);

      const removeTimer = setTimeout(() => {
        try { dropEl.remove(); } catch (e) {}
        const idx = removalTimers.indexOf(removeTimer);
        if (idx !== -1) removalTimers.splice(idx, 1);
      }, duration + 100);

      removalTimers.push(removeTimer);

      const nextDelay = 800 + Math.random() * 1200;
      schedulerTimeout = setTimeout(spawnRaindrop, nextDelay);
    };

    schedulerTimeout = setTimeout(spawnRaindrop, 1000);

    return () => {
      mounted = false;
      if (schedulerTimeout) clearTimeout(schedulerTimeout);
      removalTimers.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={styles.homeWrapper} 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      {/* Background with parallax effect */}
      <div 
        className={styles.bgDecoration}
        style={{
          transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`
        }}
      />

      {/* Floating Code Matrix */}
      <div 
        ref={codeMatrixRef}
        className={styles.codeMatrix}
        style={{
          transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`
        }}
      />

      {/* Animated Orbs */}
      <div className={styles.orbsContainer}>
        <div 
          className={`${styles.orb} ${styles.orb1}`}
          style={{
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
          }}
        />
        <div 
          className={`${styles.orb} ${styles.orb2}`}
          style={{
            transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)`
          }}
        />
        <div 
          className={`${styles.orb} ${styles.orb3}`}
          style={{
            transform: `translate(${mousePos.x * -15}px, ${mousePos.y * 30}px)`
          }}
        />
      </div>

      <div className={`${styles.contentContainer} ${isVisible ? styles.visible : ''}`}>
        {/* Hero Section with Glassmorphism */}
        <div className={styles.heroSection}>
          <div className={styles.heroLabel}>
            <span className={styles.labelDot}></span>
            DEVELOPER • RESEARCHER • INNOVATOR
            <span className={styles.labelDot}></span>
          </div>
          <h1 className={styles.heroTitle}>
            François Meiring
          </h1>
          <div className={styles.titleUnderline} />
          <p className={styles.heroSubtitle}>
            Full Stack Developer & MSc Computer Science Student
          </p>
          <p className={styles.heroDescription}>
            Crafting innovative solutions at the intersection of technology and creativity
          </p>
          
          {/* Primary CTA Buttons */}
          <div className={styles.ctaButtons}>
            <Link to="/contact" className={styles.primaryButton}>
              <span className={styles.buttonGlow}></span>
              <span className={styles.buttonContent}>
                <span>Contact & Support</span>
                <MdRocketLaunch size={20} />
              </span>
            </Link>
            <Link to="/projects" className={styles.secondaryButton}>
              <span className={styles.buttonContent}>
                <span>View Projects</span>
                <MdArrowForward size={20} />
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced Info Cards */}
        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.cardIconWrapper}>
              <div className={styles.cardIcon}>
                <MdRocketLaunch size={24} />
              </div>
            </div>
            <h3>Current Role</h3>
            <p>Full Stack Developer</p>
            <div className={styles.cardShine} />
          </div>
          <div className={styles.infoCard}>
            <div className={styles.cardIconWrapper}>
              <div className={styles.cardIcon}>
                <MdArrowForward size={24} />
              </div>
            </div>
            <h3>Education</h3>
            <p>MSc Computer Science</p>
            <div className={styles.cardShine} />
          </div>
          <div className={styles.infoCard}>
            <div className={styles.cardIconWrapper}>
              <div className={styles.cardIcon}>
                <MdRocketLaunch size={24} />
              </div>
            </div>
            <h3>Technologies</h3>
            <p>React • Node.js • Python</p>
            <div className={styles.cardShine} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;