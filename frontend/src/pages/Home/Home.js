import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdRocketLaunch, MdArrowForward } from 'react-icons/md';

/* Data */
import homeData from '../../data/home.json';

/* Images */
import image1 from '../../Images/1. Playing Guitar.jpg';
import image2 from '../../Images/2. Family Graduation.jpg';
import image3 from '../../Images/3. St. Lucia Adventure.jpg';
import image4 from '../../Images/4. Modeling.jpg';

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
  // IMAGE MAP
  // ========================================
  const imageMap = {
    1: image1,
    2: image2,
    3: image3,
    4: image4
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.pageWrapper}>
      <div 
        ref={containerRef} 
        className={`${styles.container} ${isVisible ? styles.visible : ''}`}
      >
        {/* Rain Ripple Effect */}
        <div ref={rainRef} className={styles.rainContainer} />

        {/* Animated Background */}
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
            
            <p className={styles.tagline}>{homeData.hero.tagline}</p>
            
            <p className={styles.description}>{homeData.hero.description}</p>
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

          {/* Scroll Indicator */}
          <div className={styles.scrollIndicator}>
            <div className={styles.scrollArrow}></div>
          </div>
        </div>
      </div>

      {/* Memory Lane Section - Alternating Layout */}
      <div className={styles.memoryLaneSection}>
        <div className={styles.memoryLaneContainer}>
          <div className={styles.memoryLaneHeader}>
            <div className={styles.sectionDivider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerDot} />
              <span className={styles.dividerLine} />
            </div>
            <h2 className={styles.memoryLaneTitle}>{homeData.memoryLane.title}</h2>
            <p className={styles.memoryLaneSubtitle}>{homeData.memoryLane.subtitle}</p>
          </div>
          
          <div className={styles.memoryTimeline}>
            {homeData.memoryLane.memories.map((memory, index) => (
              <div 
                key={memory.number} 
                className={`${styles.memoryItem} ${memory.number % 2 === 0 ? styles.memoryItemReverse : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={styles.memoryImageContainer}>
                  <div className={styles.memoryNumberBadge}>{memory.number}</div>
                  <img 
                    src={imageMap[memory.number]} 
                    alt={memory.title}
                    className={styles.memoryImage}
                    loading="lazy"
                  />
                  <div className={styles.memoryImageOverlay} />
                </div>
                <div className={styles.memoryTextContainer}>
                  <h3 className={styles.memoryTitle}>{memory.title}</h3>
                  <p className={styles.memoryDescription}>{memory.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
