import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './NotFound.module.css';
import '../../styles/Theme.css';

import versesData from '../verses.json';

const VERSES = versesData.verses;

const NotFound = () => {
  const { theme } = useTheme();
  const [currentVerse, setCurrentVerse] = useState(0);
  const [foundPath, setFoundPath] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [drops, setDrops] = useState([]);
  const containerRef = useRef(null);

  // Cycle through verses automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse(prev => (prev + 1) % VERSES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle click - create ripple and change verse
  const handleClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // compute position relative to container
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

    // Change to next verse
    setCurrentVerse(prev => (prev + 1) % VERSES.length);
  };

  // Spawn raindrops at random intervals; when a drop lands create a ripple
  useEffect(() => {
    let mounted = true;
    let timeout;

    const spawnDrop = () => {
      if (!mounted || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.random() * rect.width;
      // landing somewhere between 55% and 95% of height to feel natural
      const landingY = rect.height * (0.55 + Math.random() * 0.4);
      const duration = 0.6 + Math.random() * 0.9; // seconds
      const id = Date.now() + Math.random();

      const drop = { id, x, landingY, duration };
      setDrops(prev => [...prev, drop]);

      // When drop 'lands', remove it and create a ripple
      setTimeout(() => {
        setDrops(prev => prev.filter(d => d.id !== id));
        const ripple = { id: 'r' + id, x, y: landingY };
        setRipples(prev => [...prev, ripple]);
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, 1000);
      }, duration * 1000 + 40);

      // schedule next drop
      const nextDelay = 300 + Math.random() * 1200;
      timeout = setTimeout(spawnDrop, nextDelay);
    };

    // start spawning
    timeout = setTimeout(spawnDrop, 400);

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const handleGoHome = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div ref={containerRef} className={styles.container} onClick={handleClick} data-theme={theme}>
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

      {/* Raindrops (falling lines) */}
      {drops.map(drop => (
        <div
          key={drop.id}
          className={styles.raindrop}
          style={{
            left: `${drop.x}px`,
            // use CSS variable for fall distance and duration
            ['--fall-distance']: `${drop.landingY}px`,
            ['--duration']: `${drop.duration}s`
          }}
        />
      ))}

      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.numberContainer}>
          <span className={styles.number}>4</span>
          <span className={styles.number}>0</span>
          <span className={styles.number}>4</span>
        </div>

        <h1 className={styles.title}>Page Not Found</h1>
        
        <div className={styles.verseContainer} key={currentVerse}>
          <p className={styles.verse}>
            "{VERSES[currentVerse].verse}"
          </p>
          <p className={styles.reference}>{VERSES[currentVerse].reference}</p>
        </div>

        <button 
          className={styles.homeButton}
          onClick={(e) => {
            e.stopPropagation();
            handleGoHome();
          }}
          onMouseEnter={() => setFoundPath(true)}
        >
          {foundPath ? '← Find Your Way Home' : '← Go Back'}
        </button>

        <div className={styles.pathIndicator}>
          {VERSES.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${index === currentVerse ? styles.dotActive : ''}`}
            />
          ))}
        </div>

        <p className={styles.hint}>Click anywhere to reveal the next verse</p>
      </div>

      {/* Subtle background decoration */}
      <div className={styles.bgDecoration} />
    </div>
  );
};

export default NotFound;