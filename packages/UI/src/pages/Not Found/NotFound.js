import React, { useEffect, useState } from 'react';
import styles from './NotFound.module.css';
import '../../styles/Theme.css';

import versesData from '../verses.json';

const VERSES = versesData.verses;

const NotFound = () => {
  const [currentVerse, setCurrentVerse] = useState(0);
  const [foundPath, setFoundPath] = useState(false);
  const [ripples, setRipples] = useState([]);

  // Cycle through verses automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse(prev => (prev + 1) % VERSES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle click - create ripple and change verse
  const handleClick = (e) => {
    // Create ripple
    const newRipple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
    
    // Change to next verse
    setCurrentVerse(prev => (prev + 1) % VERSES.length);
  };

  const handleGoHome = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y
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