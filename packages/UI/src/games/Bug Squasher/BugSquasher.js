import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './BugSquasher.module.css';
import '../../styles/Theme.css';

/**
 * BugSquasher - A fun, interactive bug-clicking game
 * 
 * Props:
 * @param {number} gameDuration - Duration of game in seconds (default: 30)
 * @param {number} spawnInterval - How often bugs spawn in ms (default: 800)
 * @param {number} bugLifetime - How long bugs stay alive in ms (default: 3000)
 * @param {number} pointsPerBug - Points earned per bug squashed (default: 10)
 * @param {function} onGameEnd - Callback when game ends (receives final score)
 * @param {string} storageKey - localStorage key for high score (default: 'bugSquashHighScore')
 * 
 * Usage:
 * <BugSquasher 
 *   gameDuration={45} 
 *   onGameEnd={(score) => console.log('Final score:', score)}
 * />
 */

const BugSquasher = ({
  gameDuration = 30,
  spawnInterval = 800,
  bugLifetime = 3000,
  pointsPerBug = 10,
  onGameEnd = null,
  storageKey = 'bugSquashHighScore'
}) => {
  const { theme } = useTheme();
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [bugs, setBugs] = useState([]);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem(storageKey) || '0');
  });

  let gameInterval = null;
  let timerInterval = null;

  // Spawn bugs periodically during active game
  useEffect(() => {
    if (gameActive) {
      gameInterval = setInterval(() => {
        spawnBug();
      }, spawnInterval);

      return () => {
        if (gameInterval) clearInterval(gameInterval);
      };
    }
  }, [gameActive]);

  // Timer countdown
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerInterval) clearInterval(timerInterval);
      };
    }
  }, [gameActive, timeLeft]);

  const spawnBug = () => {
    const newBug = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 70 + 10,
      size: Math.random() * 20 + 30, // 30-50px
      speed: Math.random() * 3 + 2
    };

    setBugs(prev => [...prev, newBug]);

    // Remove bug after its lifetime
    setTimeout(() => {
      setBugs(prev => prev.filter(b => b.id !== newBug.id));
    }, bugLifetime);
  };

  const squashBug = (bugId, e) => {
    e.stopPropagation();
    setBugs(prev => prev.filter(b => b.id !== bugId));
    setScore(prev => prev + pointsPerBug);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(gameDuration);
    setBugs([]);
  };

  const endGame = () => {
    setGameActive(false);
    setBugs([]);
    
    // Update high score
    const newHighScore = Math.max(score, highScore);
    if (newHighScore > highScore) {
      localStorage.setItem(storageKey, newHighScore.toString());
      setHighScore(newHighScore);
    }

    // Call onGameEnd callback if provided
    if (onGameEnd) {
      onGameEnd(score);
    }
  };

  return (
    <div className={styles.bugSquasherWrapper} data-theme={theme}>
      <div className={styles.gameContainer}>
        {!gameActive ? (
          <div className={styles.gameMenu}>
            <h2 className={styles.gameTitle}>🐛 Bug Squasher 🐛</h2>
            <p className={styles.gameInstructions}>
              Click the bugs before they escape! You have {gameDuration} seconds.
            </p>
            <div className={styles.scoreDisplay}>
              <div className={styles.scoreStat}>
                <span className={styles.scoreLabel}>Last Score:</span>
                <span className={styles.scoreValue}>{score}</span>
              </div>
              <div className={styles.scoreStat}>
                <span className={styles.scoreLabel}>High Score:</span>
                <span className={styles.scoreValue}>{highScore}</span>
              </div>
            </div>
            <button onClick={startGame} className={styles.gameButton}>
              {score === 0 ? 'Start Game' : 'Play Again'}
            </button>
          </div>
        ) : (
          <div className={styles.gamePlay}>
            <div className={styles.gameStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Score:</span>
                <span className={styles.statValue}>{score}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Time:</span>
                <span className={styles.statValue}>{timeLeft}s</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>High:</span>
                <span className={styles.statValue}>{highScore}</span>
              </div>
            </div>
            <div className={styles.gameArea}>
              {bugs.map(bug => (
                <div
                  key={bug.id}
                  className={styles.bug}
                  style={{
                    left: `${bug.x}%`,
                    top: `${bug.y}%`,
                    fontSize: `${bug.size}px`,
                    animationDuration: `${bug.speed}s`
                  }}
                  onClick={(e) => squashBug(bug.id, e)}
                >
                  🐛
                </div>
              ))}
              {bugs.length === 0 && (
                <div className={styles.waitingMessage}>
                  Get ready...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BugSquasher;