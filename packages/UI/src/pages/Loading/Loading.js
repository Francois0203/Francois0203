import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

/* Styling */
import styles from './Loading.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

import versesData from '../verses.json';

const BIBLE_VERSES = versesData.verses;

const Loading = ({
  message = 'Loading...',
  showVerse = true
}) => {
  const { theme } = useTheme();
  const [currentVerse, setCurrentVerse] = useState(0);
  const [stars, setStars] = useState([]);

  // Generate random stars on mount
  useEffect(() => {
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 150; i++) {
        starArray.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 3
        });
      }
      setStars(starArray);
    };
    generateStars();
  }, []);

  // Cycle through verses
  useEffect(() => {
    if (showVerse) {
      const interval = setInterval(() => {
        setCurrentVerse(prev => (prev + 1) % BIBLE_VERSES.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [showVerse]);

  return (
    <div className={styles.loadingScreenWrapper} data-theme={theme}>
      {/* Starfield Background */}
      <div className={styles.starfield}>
        {stars.map(star => (
          <div
            key={star.id}
            className={styles.star}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Constellation Lines */}
      <svg className={styles.constellationSvg} viewBox="0 0 1920 1080">
        {/* Major constellation pattern */}
        <g className={styles.constellation}>
          <line x1="300" y1="200" x2="450" y2="180" />
          <line x1="450" y1="180" x2="550" y2="250" />
          <line x1="550" y1="250" x2="650" y2="200" />
          <line x1="450" y1="180" x2="480" y2="320" />
          <line x1="480" y1="320" x2="550" y2="250" />
          <circle cx="300" cy="200" r="4" />
          <circle cx="450" cy="180" r="4" />
          <circle cx="550" cy="250" r="4" />
          <circle cx="650" cy="200" r="4" />
          <circle cx="480" cy="320" r="4" />
        </g>

        {/* Secondary constellation */}
        <g className={`${styles.constellation} ${styles.constellation2}`}>
          <line x1="1400" y1="300" x2="1500" y2="350" />
          <line x1="1500" y1="350" x2="1550" y2="450" />
          <line x1="1550" y1="450" x2="1450" y2="500" />
          <line x1="1450" y1="500" x2="1400" y2="400" />
          <line x1="1400" y1="400" x2="1400" y2="300" />
          <circle cx="1400" cy="300" r="4" />
          <circle cx="1500" cy="350" r="4" />
          <circle cx="1550" cy="450" r="4" />
          <circle cx="1450" cy="500" r="4" />
          <circle cx="1400" cy="400" r="4" />
        </g>

        {/* Bottom constellation */}
        <g className={`${styles.constellation} ${styles.constellation3}`}>
          <line x1="800" y1="850" x2="900" y2="820" />
          <line x1="900" y1="820" x2="950" y2="900" />
          <line x1="950" y1="900" x2="1050" y2="880" />
          <circle cx="800" cy="850" r="4" />
          <circle cx="900" cy="820" r="4" />
          <circle cx="950" cy="900" r="4" />
          <circle cx="1050" cy="880" r="4" />
        </g>
      </svg>

      {/* Shooting Stars */}
      <div className={styles.shootingStarsContainer}>
        <div className={styles.shootingStar}></div>
        <div className={styles.shootingStar}></div>
        <div className={styles.shootingStar}></div>
      </div>

      {/* Nebula Effects */}
      <div className={styles.nebula}>
        <div className={styles.nebulaOrb1}></div>
        <div className={styles.nebulaOrb2}></div>
        <div className={styles.nebulaOrb3}></div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Celestial Loading Spinner */}
        <div className={styles.celestialSpinner}>
          <div className={styles.orbitRing}>
            <div className={styles.planet}></div>
          </div>
          <div className={styles.orbitRing2}>
            <div className={styles.planet2}></div>
          </div>
          <div className={styles.orbitRing3}>
            <div className={styles.planet3}></div>
          </div>
          <div className={styles.centerStar}></div>
        </div>

        {/* Loading Message */}
        <div className={styles.messageContainer}>
          <h2 className={styles.message}>{message}</h2>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>

        {/* Bible Verse with fade transition */}
        {showVerse && (
          <div className={styles.verseContainer} key={currentVerse}>
            <div className={styles.verseQuote}>
              <span className={styles.quoteMark}>"</span>
              <p className={styles.verse}>{BIBLE_VERSES[currentVerse].verse}</p>
              <span className={styles.quoteMark}>"</span>
            </div>
            <cite className={styles.reference}>— {BIBLE_VERSES[currentVerse].reference}</cite>
            <div className={styles.verseDivider}></div>
          </div>
        )}
      </div>

      {/* Corner Decorations */}
      <div className={styles.cornerDecoration} style={{ top: '20px', left: '20px' }}>✦</div>
      <div className={styles.cornerDecoration} style={{ top: '20px', right: '20px' }}>✦</div>
      <div className={styles.cornerDecoration} style={{ bottom: '20px', left: '20px' }}>✦</div>
      <div className={styles.cornerDecoration} style={{ bottom: '20px', right: '20px' }}>✦</div>
    </div>
  );
};

export default Loading;