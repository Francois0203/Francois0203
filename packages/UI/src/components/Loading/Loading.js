import React, { useState, useEffect } from 'react';

/* Styling */
import styles from './Loading.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

// Inspirational verses for loading states
const BIBLE_VERSES = [
  { verse: "Wait for the LORD; be strong and take heart and wait for the LORD.", reference: "Psalm 27:14" },
  { verse: "Be still before the LORD and wait patiently for him.", reference: "Psalm 37:7" },
  { verse: "The LORD is good to those whose hope is in him, to the one who seeks him.", reference: "Lamentations 3:25" },
  { verse: "But those who hope in the LORD will renew their strength.", reference: "Isaiah 40:31" },
  { verse: "Trust in the LORD with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" }
];

const Loading = ({
  message = 'Loading...',
  showVerse = true
}) => {
  const [currentVerse, setCurrentVerse] = useState(0);

  useEffect(() => {
    if (showVerse) {
      const interval = setInterval(() => {
        setCurrentVerse(prev => (prev + 1) % BIBLE_VERSES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showVerse]);

  return (
    <div className={styles.loadingScreenWrapper}>
      {/* Floating Orbs */}
      <div className={styles.orbsContainer}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
        <div className={`${styles.orb} ${styles.orb3}`}></div>
        <div className={`${styles.orb} ${styles.orb4}`}></div>
        <div className={`${styles.orb} ${styles.orb5}`}></div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Loading Message */}
        <div className={styles.messageContainer}>
          <h2 className={styles.message}>{message}</h2>
          <div className={styles.dots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>

        {/* Bible Verse */}
        {showVerse && (
          <div className={styles.verseContainer} key={currentVerse}>
            <p className={styles.verse}>"{BIBLE_VERSES[currentVerse].verse}"</p>
            <cite className={styles.reference}>— {BIBLE_VERSES[currentVerse].reference}</cite>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;