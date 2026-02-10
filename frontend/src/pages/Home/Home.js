import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdRocketLaunch, MdArrowForward } from 'react-icons/md';

/* Components */
import { SkillsGlobe } from '../../components';

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
  
  // ========================================
  // REFS
  // ========================================
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const heroRef = useRef(null);

  // ========================================
  // EFFECTS - Page Mount
  // ========================================
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ========================================
  // EFFECTS - Parallax Scroll (Optimized)
  // ========================================
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          if (contentRef.current) {
            contentRef.current.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
          }
          
          if (heroRef.current) {
            heroRef.current.style.transform = `translate3d(0, ${scrollY * 0.2}px, 0)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ========================================
  // HELPER FUNCTION - Dynamic Image Import
  // ========================================
  const getImage = (imageName) => {
    try {
      return require(`../../Images/${imageName}`);
    } catch (error) {
      console.error(`Image not found: ${imageName}`, error);
      return null;
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.pageWrapper}>
      {/* Skills Globe Background */}
      <div className={styles.globeBackground}>
        <SkillsGlobe />
      </div>

      <div 
        ref={containerRef} 
        className={`${styles.container} ${isVisible ? styles.visible : ''}`}
      >
        {/* Main Content */}
        <div 
          ref={contentRef}
          className={styles.content}
        >
          {/* Hero Section */}
          <div 
            ref={heroRef}
            className={styles.hero}
          >
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
                    src={getImage(memory.image)} 
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