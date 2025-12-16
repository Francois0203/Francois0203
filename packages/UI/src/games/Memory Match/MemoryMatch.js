import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

/* Styling */
import styles from './MemoryMatch.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

/**
 * MemoryMatch - A classic memory card matching game
 * 
 * Props:
 * @param {number} gameDuration - Duration of game in seconds (default: 60)
 * @param {number} gridSize - Number of pairs (4 = 4x2 grid, 6 = 4x3 grid, 8 = 4x4 grid) (default: 8)
 * @param {number} pointsPerMatch - Points earned per matched pair (default: 100)
 * @param {number} penaltyPerMiss - Points lost per wrong match (default: 10)
 * @param {function} onGameEnd - Callback when game ends (receives final score)
 * @param {string} storageKey - localStorage key for high score (default: 'memoryMatchHighScore')
 * 
 * Usage:
 * <MemoryMatch 
 *   gameDuration={90} 
 *   gridSize={6}
 *   onGameEnd={(score) => console.log('Final score:', score)}
 * />
 */

const MemoryMatch = ({
  gameDuration = 60,
  gridSize = 8,
  pointsPerMatch = 100,
  penaltyPerMiss = 10,
  onGameEnd = null,
  storageKey = 'memoryMatchHighScore'
}) => {
  const { theme } = useTheme();
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem(storageKey) || '0');
  });

  // Card symbols - emojis for the memory game
  const symbols = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🏀', '⚽', '🎾', '🏐', '🎳', '🏆'];

  // Timer countdown
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [gameActive, timeLeft]);

  // Check for game completion
  useEffect(() => {
    if (gameActive && matchedCards.length === cards.length && cards.length > 0) {
      // Add bonus for completing the game
      const timeBonus = timeLeft * 10;
      setScore(prev => prev + timeBonus);
      setTimeout(() => endGame(), 500);
    }
  }, [matchedCards, cards, gameActive]);

  // Check if two flipped cards match
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = flippedCards;
      
      if (cards[firstIndex].symbol === cards[secondIndex].symbol) {
        // Match found!
        setMatchedCards(prev => [...prev, firstIndex, secondIndex]);
        setScore(prev => prev + pointsPerMatch);
        setFlippedCards([]);
        setIsChecking(false);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
          setScore(prev => Math.max(0, prev - penaltyPerMiss));
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards]);

  const initializeCards = () => {
    // Create pairs of cards
    const selectedSymbols = symbols.slice(0, gridSize);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle cards
    const shuffled = cardPairs
      .map((symbol, index) => ({ symbol, id: index }))
      .sort(() => Math.random() - 0.5);
    
    return shuffled;
  };

  const handleCardClick = (index) => {
    // Prevent clicking if checking, already flipped, or already matched
    if (isChecking || flippedCards.includes(index) || matchedCards.includes(index)) {
      return;
    }

    // Prevent flipping more than 2 cards
    if (flippedCards.length >= 2) {
      return;
    }

    setFlippedCards(prev => [...prev, index]);
  };

  const startGame = () => {
    const initialCards = initializeCards();
    setCards(initialCards);
    setGameActive(true);
    setScore(0);
    setTimeLeft(gameDuration);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setIsChecking(false);
  };

  const endGame = () => {
    setGameActive(false);
    
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

  const isCardFlipped = (index) => {
    return flippedCards.includes(index) || matchedCards.includes(index);
  };

  const isCardMatched = (index) => {
    return matchedCards.includes(index);
  };

  const getGridClass = () => {
    if (gridSize <= 4) return styles.gridSmall;
    if (gridSize <= 6) return styles.gridMedium;
    return styles.gridLarge;
  };

  return (
    <div className={styles.memoryMatchWrapper} data-theme={theme}>
      <div className={styles.gameContainer}>
        {!gameActive ? (
          <div className={styles.gameMenu}>
            <h2 className={styles.gameTitle}>🧠 Memory Match 🧠</h2>
            <p className={styles.gameInstructions}>
              Find all matching pairs of cards before time runs out!
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
              {moves > 0 && (
                <div className={styles.scoreStat}>
                  <span className={styles.scoreLabel}>Moves:</span>
                  <span className={styles.scoreValue}>{moves}</span>
                </div>
              )}
            </div>
            <button onClick={startGame} className={styles.gameButton}>
              <span>{score === 0 ? 'Start Game' : 'Play Again'}</span>
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
                <span className={styles.statLabel}>Moves:</span>
                <span className={styles.statValue}>{moves}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Pairs:</span>
                <span className={styles.statValue}>{matchedCards.length / 2}/{gridSize}</span>
              </div>
            </div>
            <div className={`${styles.gameArea} ${getGridClass()}`}>
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`${styles.card} ${
                    isCardFlipped(index) ? styles.flipped : ''
                  } ${
                    isCardMatched(index) ? styles.matched : ''
                  }`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className={styles.cardInner}>
                    <div className={styles.cardFront}>?</div>
                    <div className={styles.cardBack}>{card.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;
