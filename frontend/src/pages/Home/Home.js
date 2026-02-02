import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MdRocketLaunch, MdArrowForward, MdWorkOutline, MdCode } from 'react-icons/md';

/* Data */
import homeData from '../../data/home.json';

/* Styling */
import styles from './Home.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * HOME PAGE - OPTIMIZED
 * ============================================================================
 * Professional landing page with smooth, performant animations
 * Optimized for all devices without lag
 * ============================================================================
 */

const Home = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [isVisible, setIsVisible] = useState(false);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  
  // ========================================
  // REFS
  // ========================================
  const containerRef = useRef(null);
  const rainRef = useRef(null);
  const reduceAnimations = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // ========================================
  // EFFECTS - Page Mount
  // ========================================
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ========================================
  // EFFECTS - Rain Ripple Animation
  // ========================================
  useEffect(() => {
    if (reduceAnimations.current || !rainRef.current) return;

    let mounted = true;
    const drops = [];
    const maxDrops = 4; // Reduced amount

    const createRainDrop = () => {
      if (!mounted || !rainRef.current || drops.length >= maxDrops) return;

      const startX = Math.random() * 100;
      const endY = 50 + Math.random() * 50; // Land somewhere in middle-bottom of screen

      // Create falling drop
      const drop = document.createElement('div');
      drop.className = styles.fallingDrop;
      drop.style.left = `${startX}%`;
      drop.style.setProperty('--end-y', `${endY}vh`);

      rainRef.current.appendChild(drop);
      drops.push(drop);

      // Create ripple where drop lands after fall animation
      setTimeout(() => {
        const ripple = document.createElement('div');
        ripple.className = styles.rainDrop;
        ripple.style.left = `${startX}%`;
        ripple.style.top = `${endY}vh`;
        // Random ripple size (100px - 250px)
        const rippleSize = 100 + Math.random() * 150;
        ripple.style.setProperty('--ripple-size', `${rippleSize}px`);

        if (rainRef.current) {
          rainRef.current.appendChild(ripple);
          drops.push(ripple);
        }

        setTimeout(() => {
          if (ripple.parentNode) ripple.remove();
          const idx = drops.indexOf(ripple);
          if (idx !== -1) drops.splice(idx, 1);
        }, 2000);
      }, 800); // Duration of fall

      // Remove falling drop
      setTimeout(() => {
        if (drop.parentNode) drop.remove();
        const idx = drops.indexOf(drop);
        if (idx !== -1) drops.splice(idx, 1);
      }, 900);
    };

    // Start with fewer drops
    setTimeout(createRainDrop, 500);
    setTimeout(createRainDrop, 1500);

    const rainInterval = setInterval(() => {
      if (mounted && drops.length < maxDrops) createRainDrop();
    }, 3000); // Less frequent

    return () => {
      mounted = false;
      clearInterval(rainInterval);
      drops.forEach(drop => drop.remove());
    };
  }, []);

  // ========================================
  // EFFECTS - Click Ripple Effect
  // ========================================
  useEffect(() => {
    if (reduceAnimations.current || !rainRef.current) return;

    const handleClick = (e) => {
      if (!rainRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const ripple = document.createElement('div');
      ripple.className = styles.rainDrop;
      ripple.style.left = `${x}%`;
      ripple.style.top = `${y}%`;
      // Consistent click ripple size (200px)
      ripple.style.setProperty('--ripple-size', '200px');

      rainRef.current.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
      }, 2000);
    };

    const container = containerRef.current;
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, []);

  // ========================================
  // EFFECTS - Typing Animation
  // ========================================
  useEffect(() => {
    const titles = homeData.hero.titles;
    const currentTitle = titles[currentTitleIndex];
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    let timeout;

    if (!isDeleting) {
      if (displayedText.length < currentTitle.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentTitle.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentTitleIndex]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleStatHover = useCallback((index) => {
    setHoveredStat(index);
  }, []);

  const handleStatLeave = useCallback(() => {
    setHoveredStat(null);
  }, []);

  // ========================================
  // ICON MAP
  // ========================================
  const iconMap = {
    MdWorkOutline,
    MdRocketLaunch,
    MdCode
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} ${isVisible ? styles.visible : ''}`}
    >
      {/* Rain Ripple Effect */}
      <div ref={rainRef} className={styles.rainContainer} />

      {/* Animated Background - CSS Only */}
      <div className={styles.backgroundEffects}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.greetingWrapper}>
            <span className={styles.decorLine} />
            <p className={styles.greeting}>{homeData.hero.greeting}</p>
            <span className={styles.decorLine} />
          </div>
          
          <h1 className={styles.name}>
            {homeData.hero.name}
          </h1>
          
          <div className={styles.titleContainer}>
            <div className={styles.titleWrapper}>
              <span className={styles.titleBracket}>{'<'}</span>
              <h2 className={styles.title}>
                {displayedText}
                <span className={styles.cursor}>|</span>
              </h2>
              <span className={styles.titleBracket}>{'/>'}</span>
            </div>
          </div>
          
          <p className={styles.description}>{homeData.hero.description}</p>
          
          {/* Decorative Elements */}
          <div className={styles.heroDecor}>
            <div className={styles.decorDot} />
            <div className={styles.decorDot} />
            <div className={styles.decorDot} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.statsContainer}>
          {homeData.quickStats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            return (
              <div 
                key={index} 
                className={`${styles.statCard} ${hoveredStat === index ? styles.statCardActive : ''}`}
                onMouseEnter={() => handleStatHover(index)}
                onMouseLeave={handleStatLeave}
              >
                <div className={styles.statIconWrapper}>
                  <div className={styles.statIcon}>
                    {Icon && <Icon />}
                  </div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className={styles.ctaContainer}>
          <Link to={homeData.cta.primary.link} className={`${styles.button} ${styles.primaryButton}`}>
            <MdRocketLaunch />
            <span>{homeData.cta.primary.text}</span>
          </Link>
          
          <Link to={homeData.cta.secondary.link} className={`${styles.button} ${styles.secondaryButton}`}>
            <span>{homeData.cta.secondary.text}</span>
            <MdArrowForward />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
