# Quantum Grid

A hard Lights-Out variant that demands planning and reasoning. Toggle cells to flip them and their orthogonal neighbors; the goal is to turn every cell off.

## Features
- Configurable `gridSize` (default 6) for high difficulty
- Scramble ensures the puzzle is solvable (generated from the solved state)
- Time-limited challenge with move-based scoring
- Hints available (apply a correct move) at a time penalty
- Theme-aware styling using `Theme.css` variables

## Props
- `gridSize` (number) — board width/height in cells (default `6`)
- `scrambleMoves` (number) — how many random moves to scramble with (default `18`)
- `gameDuration` (number) — time allowed in seconds (default `180`)
- `onGameEnd` (function) — callback receiving `{ won, moves, timeLeft, score }`
- `storageKey` (string) — localStorage key for high score (default `'quantumGridHighScore'`)

## Usage

```jsx
import QuantumGrid from 'packages/UI/src/games/Quantum Grid';

function App(){
  return <QuantumGrid gridSize={7} scrambleMoves={24} gameDuration={300} />;
}
```

## Notes
- The scramble algorithm applies random moves to a solved board, so a solution exists (the applied moves).
- Hints automatically apply one of those solution moves but cost time.
- This is intended to be a mentally demanding puzzle — try to minimize moves!
