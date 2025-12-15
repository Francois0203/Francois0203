import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../../packages/UI/src/hooks/useTheme';

/* Styling */
import styles from './QuantumGrid.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

/**
 * QuantumGrid - A challenging Lights-Out style puzzle that requires planning.
 *
 * Props:
 * @param {number} gridSize - number of cells per side (default 6)
 * @param {number} scrambleMoves - number of random moves to scramble (default 18)
 * @param {number} gameDuration - seconds allowed (default 180)
 * @param {function} onGameEnd - callback when game ends (receives {won, moves, timeLeft, score})
 * @param {string} storageKey - localStorage key for high score (default 'quantumGridHighScore')
 *
 * Gameplay:
 * - Toggle a cell to flip it and orthogonal neighbors.
 * - Goal: turn all lights off (dark) using as few moves as possible.
 * - Hints reveal one correct move but penalize score.
 */

const QuantumGrid = ({
  gridSize = 6,
  scrambleMoves = 18,
  gameDuration = 180,
  onGameEnd = null,
  storageKey = 'quantumGridHighScore'
}) => {
  const { theme } = useTheme();
  const totalCells = gridSize * gridSize;
  const [cells, setCells] = useState(Array(totalCells).fill(false)); // false = off/dark, true = on
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [active, setActive] = useState(false);
  const [scrambleSeq, setScrambleSeq] = useState([]); // moves used to generate puzzle (solution exists)
  const [hintPenalty, setHintPenalty] = useState(50);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem(storageKey) || '0'));
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    // ensure cells array length updates when gridSize changes
    setCells(Array(gridSize * gridSize).fill(false));
  }, [gridSize]);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          finish(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [active]);

  useEffect(() => {
    if (active && cells.every(c => c === false)) {
      // solved
      finish(true);
    }
  }, [cells]);

  const indexToRC = (i) => ({ r: Math.floor(i / gridSize), c: i % gridSize });
  const rcToIndex = (r, c) => r * gridSize + c;

  const toggleAt = (idx, state) => {
    const { r, c } = indexToRC(idx);
    const updated = state.slice();

    const flip = (rr, cc) => {
      if (rr >= 0 && rr < gridSize && cc >= 0 && cc < gridSize) {
        const k = rcToIndex(rr, cc);
        updated[k] = !updated[k];
      }
    };

    flip(r, c);
    flip(r - 1, c);
    flip(r + 1, c);
    flip(r, c - 1);
    flip(r, c + 1);

    return updated;
  };

  const handleCellClick = (i) => {
    if (!active) return;
    setCells(prev => toggleAt(i, prev));
    setMoves(m => m + 1);
  };

  const scramble = (seedMoves = scrambleMoves) => {
    // start from solved (all false) and apply random moves; record them
    let state = Array(gridSize * gridSize).fill(false);
    const seq = [];
    for (let k = 0; k < seedMoves; k++) {
      const rand = Math.floor(Math.random() * totalCells);
      seq.push(rand);
      state = toggleAt(rand, state);
    }
    setCells(state);
    setScrambleSeq(seq);
  };

  const start = () => {
    setMoves(0);
    setTimeLeft(gameDuration);
    setMessage('');
    scramble(Math.max(6, scrambleMoves));
    setActive(true);
  };

  const finish = (won) => {
    setActive(false);
    clearInterval(timerRef.current);
    // score: base 1000, subtract moves*10, add remaining time*5, big bonus for solving
    const base = won ? 1500 : 300;
    const score = Math.max(0, base + (timeLeft * 5) - (moves * 10));
    if (score > highScore) {
      localStorage.setItem(storageKey, score.toString());
      setHighScore(score);
    }
    setMessage(won ? `Solved! Score: ${score}` : `Time's up — Score: ${score}`);
    if (onGameEnd) onGameEnd({ won, moves, timeLeft, score });
  };

  const hint = () => {
    if (!active || scrambleSeq.length === 0) return;
    // reveal one move from the scramble sequence (apply it) — moves closer to solution
    // take the last scramble move for deterministic behavior
    const seq = scrambleSeq.slice();
    const move = seq.pop();
    setScrambleSeq(seq);
    setCells(prev => toggleAt(move, prev));
    setMoves(m => m + 1);
    // apply penalty by reducing time or by marking message
    setTimeLeft(t => Math.max(0, t - Math.floor(hintPenalty / 10)));
    setMessage('Hint used (time penalty)');
  };

  const reset = () => {
    setCells(Array(totalCells).fill(false));
    setMoves(0);
    setTimeLeft(gameDuration);
    setActive(false);
    setScrambleSeq([]);
    setMessage('');
  };

  const renderCell = (on, i) => (
    <button
      key={i}
      className={`${styles.cell} ${on ? styles.on : ''}`}
      onClick={() => handleCellClick(i)}
      aria-label={`cell-${i}`}
    >
      <span className={styles.cellInner} />
    </button>
  );

  return (
    <div className={styles.wrapper} data-theme={theme}>
      <div className={styles.container}>
        {!active ? (
          <div className={styles.menu}>
            <h2 className={styles.title}>⚛️ Quantum Grid ⚛️</h2>
            <p className={styles.instructions}>A tough Lights-Out variant — turn every cell dark. Plan your moves carefully.</p>
            <div className={styles.statsRow}>
              <div className={styles.statBox}><div className={styles.statLabel}>High Score</div><div className={styles.statValue}>{highScore}</div></div>
              <div className={styles.statBox}><div className={styles.statLabel}>Grid</div><div className={styles.statValue}>{gridSize}×{gridSize}</div></div>
              <div className={styles.statBox}><div className={styles.statLabel}>Scramble</div><div className={styles.statValue}>{scrambleMoves}</div></div>
            </div>
            <div className={styles.menuButtons}>
              <button className={styles.btnPrimary} onClick={start}>Start Puzzle</button>
              <button className={styles.btn} onClick={() => { reset(); scramble(8); setMessage('Preview scramble'); }}>Preview</button>
            </div>
            <div className={styles.note}>{message}</div>
          </div>
        ) : (
          <div className={styles.playArea}>
            <div className={styles.headerRow}>
              <div className={styles.headerStat}><div className={styles.hLabel}>Moves</div><div className={styles.hValue}>{moves}</div></div>
              <div className={styles.headerStat}><div className={styles.hLabel}>Time</div><div className={styles.hValue}>{timeLeft}s</div></div>
              <div className={styles.headerStat}><div className={styles.hLabel}>Remaining</div><div className={styles.hValue}>{cells.filter(Boolean).length}</div></div>
              <div className={styles.headerButtons}>
                <button className={styles.btn} onClick={hint}>Hint (cost)</button>
                <button className={styles.btn} onClick={() => { reset(); start(); }}>Restart</button>
                <button className={styles.btn} onClick={() => { reset(); if (onGameEnd) onGameEnd({ won: false, moves, timeLeft, score: 0 }); }}>Quit</button>
              </div>
            </div>

            <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {cells.map((on, i) => renderCell(on, i))}
            </div>
            <div className={styles.footer}>{message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantumGrid;
