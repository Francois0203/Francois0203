import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack } from 'react-icons/md';
import { LightWaveButton } from '../../components';
import { useBlobPhysics } from '../../hooks';
import styles from './NotFound.module.css';

const SAYINGS = [
  { text: 'This page is in a superposition of existing and not existing. You just collapsed the wave function.',       attribution: "Schrödinger's Server"  },
  { text: 'Not all who wander are lost — but this URL definitely is.',                                                 attribution: 'A GPS, Ironically'     },
  { text: 'The server checked everywhere. Under the tables, behind the CDN, even cleared the cache. Nothing.',        attribution: 'Sys Admin, 2 a.m.'     },
  { text: 'This page was like a semicolon in production: briefly there, then suddenly not.',                          attribution: 'DevOps Team'           },
  { text: "We asked the database. It returned NULL. We're as surprised as you are.",                                  attribution: 'Query Result'          },
  { text: "Your destination exists in the git history. That's basically archaeology at this point.",                  attribution: 'Senior Developer'      },
  { text: 'This page went out for a quick refactor and never came back.',                                             attribution: 'The Office Manager'    },
  { text: '404: the digital equivalent of opening the fridge, forgetting what you wanted, and closing it again.',    attribution: 'Relatable Engineering' },
  { text: 'The page has gone the way of Internet Explorer — appreciated by some, gone by most.',                     attribution: 'Browser History'       },
  { text: 'Your URL had excellent ambition. The destination, however, declined to participate.',                      attribution: 'Product Manager'       },
  { text: 'Life is a journey, not a destination. This URL interpreted that very literally.',                          attribution: 'Inspirational Poster'  },
  { text: "Everything is fine. The page is fine. We're all fine. (The page is not fine.)",                           attribution: 'Status Page'           },
];

const BLOB_DEFS = [
  { r: 240, sx: 0.05, sy: 0.05, vx:  10, vy:   6, rotSpeed:  3.5 },
  { r: 190, sx: 0.70, sy: 0.65, vx:  -8, vy:  -5, rotSpeed: -4.0 },
  { r: 160, sx: 0.42, sy: 0.72, vx:   6, vy:  -9, rotSpeed:  5.0 },
  { r: 130, sx: 0.12, sy: 0.60, vx:  -7, vy:   8, rotSpeed: -6.0 },
  { r: 150, sx: 0.72, sy: 0.18, vx:   9, vy:  -6, rotSpeed:  7.0 },
  { r: 110, sx: 0.50, sy: 0.48, vx:  -9, vy:   5, rotSpeed: -4.5 },
];

const BLOB_CLASSES = [
  [styles.ambientSquare, styles.ambient1],
  [styles.ambientSquare, styles.ambient2],
  [styles.ambientSquare, styles.ambient3],
  [styles.glassSquare,   styles.square1 ],
  [styles.glassSquare,   styles.square2 ],
  [styles.glassSquare,   styles.square3 ],
];

const NotFound = () => {
  const navigate = useNavigate();
  const [currentSaying, setCurrentSaying] = useState(0);
  const [sayingVisible, setSayingVisible]  = useState(true);
  const { blobRefs, onMouseMove } = useBlobPhysics(BLOB_DEFS, { withRotation: true, maxSpeed: 18 });

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => window.history.length > 1 ? navigate(-1) : navigate('/');

  useEffect(() => {
    let swapTimeout;
    const interval = setInterval(() => {
      setSayingVisible(false);
      swapTimeout = setTimeout(() => {
        setCurrentSaying(prev => (prev + 1) % SAYINGS.length);
        setSayingVisible(true);
      }, 500);
    }, 9000);
    return () => { clearInterval(interval); clearTimeout(swapTimeout); };
  }, []);

  return (
    <div className={styles.root} onMouseMove={onMouseMove}>
      <div className={styles.blobField} aria-hidden="true">
        {BLOB_DEFS.map((_, i) => (
          <div key={i} ref={el => { blobRefs.current[i] = el; }} className={BLOB_CLASSES[i].join(' ')} />
        ))}
      </div>

      <main className={styles.card}>
        <div className={styles.statusBadge} aria-label="HTTP Error 404">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Error 404</span>
        </div>

        <div className={styles.codeDisplay} aria-hidden="true">404</div>

        <h1 className={styles.heading}>Page Not Found</h1>
        <p className={styles.subtext}>
          The page you&rsquo;re looking for has gone missing &mdash; not unlike
          a semicolon in production code.
        </p>

        <div className={styles.divider} aria-hidden="true" />

        <div className={`${styles.sayingBlock} ${sayingVisible ? styles.sayingVisible : styles.sayingHidden}`}>
          <p className={styles.sayingText}>
            <span className={styles.quoteMark}>&ldquo;</span>
            {SAYINGS[currentSaying].text}
            <span className={styles.quoteMark}>&rdquo;</span>
          </p>
          <cite className={styles.sayingAttribution}>— {SAYINGS[currentSaying].attribution}</cite>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.actions}>
          <LightWaveButton onClick={handleGoHome}>
            <MdHome aria-hidden="true" />
            Go Home
          </LightWaveButton>
          <button type="button" onClick={handleGoBack} className={styles.backButton}>
            <MdArrowBack aria-hidden="true" />
            Go Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
