import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './NotFound.module.css';
import '../../styles/Theme.css';

import * as Games from '../../games';

const NotFound = () => {
  const { theme } = useTheme();
  
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  // Build list of available games exported from the games folder
  const availableGames = Object.entries(Games).map(([key, Comp]) => ({ key, Comp }));
  const [selectedGameIndex, setSelectedGameIndex] = useState(() => {
    return Math.floor(Math.random() * Math.max(1, availableGames.length));
  });
  const [gameKey, setGameKey] = useState(Date.now());

  const chooseRandomGame = () => {
    if (!availableGames.length) return;
    const idx = Math.floor(Math.random() * availableGames.length);
    setSelectedGameIndex(idx);
    setGameKey(Date.now()); // force remount
  };

  

  // Lightweight parallax/tilt: use mouse position to update transform via rAF
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastX = 0;
    let lastY = 0;

    const handleMove = (e) => {
      const evt = e.touches ? e.touches[0] : e;
      const rect = container.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      lastX = (x / rect.width) * 2 - 1; // -1 .. 1
      lastY = (y / rect.height) * 2 - 1; // -1 .. 1

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rotateX = (-lastY * 8).toFixed(2);
        const rotateY = (lastX * 10).toFixed(2);
        const translateX = (lastX * 8).toFixed(1);
        const translateY = (lastY * -6).toFixed(1);
        if (cardRef.current) {
          cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0)`;
        }
      });
    };

    const handleLeave = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 420ms cubic-bezier(.2,.8,.2,1)';
        cardRef.current.style.transform = 'none';
        setTimeout(() => {
          if (cardRef.current) cardRef.current.style.transition = '';
        }, 500);
      }
    };

    container.addEventListener('mousemove', handleMove, { passive: true });
    container.addEventListener('touchmove', handleMove, { passive: true });
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('touchend', handleLeave);

    return () => {
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('touchmove', handleMove);
      container.removeEventListener('mouseleave', handleLeave);
      container.removeEventListener('touchend', handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleGoHome = (e) => {
    e?.stopPropagation();
    if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  return (
    <div ref={containerRef} className={styles.container} data-theme={theme}>
      <div className={styles.bgDecoration} />

        <div ref={cardRef} className={styles.card} role="main" aria-labelledby="nf-title">
        <div className={styles.code}>404 - Page Not Found</div>

        <div className={styles.headerRow}>
          <button className={styles.homeButton} onClick={handleGoHome}>← Home</button>
        </div>

        <div className={styles.content}>

          <div className={styles.refreshRow}>
            <button onClick={() => chooseRandomGame()} className={styles.refreshButton}>Refresh Game</button>
          </div>

          <div className={styles.gamePanel} onClick={(e) => e.stopPropagation()}>
          {availableGames.length ? (
            (() => {
              const GameComp = availableGames[selectedGameIndex].Comp;
              return <div key={gameKey} className={styles.externalGame}><GameComp /></div>;
            })()
          ) : (
            <div className={styles.gameHeader}>No games available</div>
          )}
          </div>
        </div>
      </div>

      <div className={styles.shapes} aria-hidden>
        <span className={styles.shape} style={{ left: '12%', top: '18%', '--s': 1 }} />
        <span className={styles.shape} style={{ left: '78%', top: '28%', '--s': 0.8 }} />
        <span className={styles.shape} style={{ left: '52%', top: '74%', '--s': 1.2 }} />
      </div>
    </div>
  );
};

export default NotFound;