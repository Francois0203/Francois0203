import React, { useEffect, useRef, useState } from 'react';
import { MdSpeed, MdLightbulb, MdPrecisionManufacturing, MdGroups } from 'react-icons/md';
import styles from './Home.module.css';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Click ripple effect (like Bio page)
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

  // Spawn raindrops that fall and create ripples where they land
  useEffect(() => {
    let mounted = true;
    let schedulerTimeout = null;
    const removalTimers = [];

    const spawnRaindrop = () => {
      if (!mounted || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const startX = Math.random() * rect.width;
      const endY = 200 + Math.random() * (rect.height - 200); // Land somewhere below top
      const duration = 800 + Math.random() * 400;

      // Create raindrop line
      const dropEl = document.createElement('div');
      dropEl.className = styles.raindrop;
      dropEl.style.left = `${startX}px`;
      dropEl.style.top = `0px`;
      dropEl.style.setProperty('--end-y', `${endY}px`);
      dropEl.style.setProperty('--duration', `${duration}ms`);
      containerRef.current.appendChild(dropEl);

      // Create ripple where it lands
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

  const qualities = [
    {
      icon: <MdSpeed size={40} />,
      title: 'Fast & Efficient',
      description: 'Delivering optimized solutions with performance in mind'
    },
    {
      icon: <MdLightbulb size={40} />,
      title: 'Innovative Thinker',
      description: 'Creative problem-solving with modern technologies'
    },
    {
      icon: <MdPrecisionManufacturing size={40} />,
      title: 'Detail-Oriented',
      description: 'Precise code craftsmanship and attention to quality'
    },
    {
      icon: <MdGroups size={40} />,
      title: 'Team Player',
      description: 'Collaborative approach to building great products'
    }
  ];

  return (
    <div ref={containerRef} className={styles.homeWrapper} onClick={handleClick}>
      {/* Background decoration */}
      <div className={styles.bgDecoration} />

      <div className={`${styles.contentContainer} ${isVisible ? styles.visible : ''}`}>
        {/* Name Section */}
        <div className={styles.nameSection}>
          <h1 className={styles.firstName}>Francois</h1>
          <h1 className={styles.lastName}>Meiring</h1>
          <div className={styles.dividerLine} />
          <h2 className={styles.role}>Full Stack Developer</h2>
        </div>

        {/* Quality Cards */}
        <div className={styles.qualityCards}>
          {qualities.map((quality, index) => (
            <div
              key={index}
              className={styles.qualityCard}
              style={{ '--delay': `${index * 0.15}s` }}
            >
              <div className={styles.cardGlass} />
              <div className={styles.cardContent}>
                <div className={styles.cardIcon}>
                  {quality.icon}
                </div>
                <h3 className={styles.cardTitle}>{quality.title}</h3>
                <p className={styles.cardDescription}>{quality.description}</p>
              </div>
              <div className={styles.cardShine} />
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className={styles.techSection}>
          <div className={styles.techStack}>
            <span className={styles.tech}>React</span>
            <span className={styles.tech}>Node.js</span>
            <span className={styles.tech}>Python</span>
            <span className={styles.tech}>Docker</span>
            <span className={styles.tech}>PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;