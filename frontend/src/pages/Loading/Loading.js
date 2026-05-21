import { useState, useEffect } from 'react';
import { useBlobPhysics } from '../../hooks';
import styles from './Loading.module.css';

const BIBLE_VERSES = [
  { verse: 'Wait for the LORD; be strong and take heart and wait for the LORD.',                                                                              reference: 'Psalm 27:14'      },
  { verse: 'Be still before the LORD and wait patiently for him.',                                                                                            reference: 'Psalm 37:7'       },
  { verse: 'The LORD is good to those whose hope is in him, to the one who seeks him.',                                                                       reference: 'Lamentations 3:25'},
  { verse: 'But those who hope in the LORD will renew their strength.',                                                                                       reference: 'Isaiah 40:31'     },
  { verse: 'Trust in the LORD with all your heart and lean not on your own understanding.',                                                                   reference: 'Proverbs 3:5'     },
  { verse: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you.',                                               reference: 'Jeremiah 29:11'   },
  { verse: 'The LORD is my light and my salvation — whom shall I fear?',                                                                                      reference: 'Psalm 27:1'       },
  { verse: 'Cast all your anxiety on him because he cares for you.',                                                                                          reference: '1 Peter 5:7'      },
  { verse: 'Be still, and know that I am God.',                                                                                                               reference: 'Psalm 46:10'      },
  { verse: 'The LORD will fight for you; you need only to be still.',                                                                                         reference: 'Exodus 14:14'     },
  { verse: 'In quietness and trust is your strength.',                                                                                                        reference: 'Isaiah 30:15'     },
  { verse: 'He will cover you with his feathers, and under his wings you will find refuge.',                                                                  reference: 'Psalm 91:4'       },
  { verse: 'The LORD is near to all who call on him, to all who call on him in truth.',                                                                       reference: 'Psalm 145:18'     },
  { verse: 'Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.',                                 reference: 'Philippians 4:6'  },
  { verse: 'I can do all things through Christ who strengthens me.',                                                                                          reference: 'Philippians 4:13' },
  { verse: 'I am the way, the truth, and the life.',                                                                                                          reference: 'John 14:6'        },
  { verse: 'Even though I walk through the darkest valley, I will fear no evil.',                                                                             reference: 'Psalm 23:4'       },
  { verse: 'Your word is a lamp for my feet, a light on my path.',                                                                                            reference: 'Psalm 119:105'    },
  { verse: 'The Lord is my shepherd; I shall not want.',                                                                                                      reference: 'Psalm 23:1'       },
  { verse: 'For God so loved the world that he gave his one and only Son.',                                                                                   reference: 'John 3:16'        },
  { verse: 'Come to me, all you who are weary and burdened, and I will give you rest.',                                                                       reference: 'Matthew 11:28'    },
  { verse: 'Seek first his kingdom and his righteousness.',                                                                                                    reference: 'Matthew 6:33'     },
];

const BLOB_DEFS = [
  { r: 270, sx: 0.10, sy: 0.12, vx:  13, vy:   8 },
  { r: 240, sx: 0.65, sy: 0.62, vx: -10, vy:  -7 },
  { r: 200, sx: 0.46, sy: 0.34, vx:   8, vy: -11 },
  { r: 170, sx: 0.16, sy: 0.20, vx:  -8, vy:  10 },
  { r: 185, sx: 0.68, sy: 0.58, vx:  10, vy:  -8 },
  { r: 135, sx: 0.56, sy: 0.15, vx: -11, vy:   7 },
];

const BLOB_CLASSES = [
  [styles.ambientBlob, styles.ambient1],
  [styles.ambientBlob, styles.ambient2],
  [styles.ambientBlob, styles.ambient3],
  [styles.glassBlob,   styles.glass1  ],
  [styles.glassBlob,   styles.glass2  ],
  [styles.glassBlob,   styles.glass3  ],
];

const DOT_COUNT = 4;

const Loading = ({ message = 'Loading', showVerse = true }) => {
  const [currentVerse, setCurrentVerse] = useState(0);
  const [verseVisible, setVerseVisible] = useState(true);
  const { blobRefs, onMouseMove } = useBlobPhysics(BLOB_DEFS);

  useEffect(() => {
    if (!showVerse) return;
    let swapTimeout;
    const interval = setInterval(() => {
      setVerseVisible(false);
      swapTimeout = setTimeout(() => {
        setCurrentVerse(prev => (prev + 1) % BIBLE_VERSES.length);
        setVerseVisible(true);
      }, 500);
    }, 7000);
    return () => { clearInterval(interval); clearTimeout(swapTimeout); };
  }, [showVerse]);

  return (
    <div className={styles.wrapper} onMouseMove={onMouseMove}>
      <div className={styles.blobField} aria-hidden="true">
        {BLOB_DEFS.map((_, i) => (
          <div key={i} ref={el => { blobRefs.current[i] = el; }} className={BLOB_CLASSES[i].join(' ')} />
        ))}
      </div>

      <div className={styles.glassCard}>
        <p className={styles.message}>{message}</p>

        <div className={styles.dotsRow} role="status" aria-label="Loading">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <span key={i} className={styles.dot} style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>

        {showVerse && (
          <div className={`${styles.verseBlock} ${verseVisible ? styles.verseVisible : styles.verseHidden}`}>
            <div className={styles.verseDivider} />
            <p className={styles.verseText}>
              <span className={styles.quoteMark}>&ldquo;</span>
              {BIBLE_VERSES[currentVerse].verse}
              <span className={styles.quoteMark}>&rdquo;</span>
            </p>
            <cite className={styles.verseRef}>— {BIBLE_VERSES[currentVerse].reference}</cite>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
