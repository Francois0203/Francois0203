# Memory Match

A classic memory card matching game component used by the UI package.

## Features
- Flip cards to find matching pairs
- Score tracking with bonuses for speed
- Time-based gameplay with countdown timer
- Customizable grid sizes (4, 6, or 8 pairs)
- High score persistence using localStorage
- Responsive design for all screen sizes

## Props

- `gameDuration` (number) — game length in seconds (default: `60`)
- `gridSize` (number) — number of pairs to match (4, 6, or 8) (default: `8`)
- `pointsPerMatch` (number) — points awarded for each match (default: `100`)
- `penaltyPerMiss` (number) — points deducted for wrong matches (default: `10`)
- `onGameEnd` (function) — optional callback called with final score when the game ends
- `storageKey` (string) — localStorage key for high score (default: `'memoryMatchHighScore'`)

## Usage

Import the component and render it in your app:

```jsx
import MemoryMatch from 'packages/UI/src/games/Memory Match';

function App() {
  return (
    <MemoryMatch
      gameDuration={90}
      gridSize={6}
      pointsPerMatch={150}
      penaltyPerMiss={5}
      onGameEnd={score => console.log('Final score:', score)}
    />
  );
}
```

## Gameplay

1. Click "Start Game" to begin
2. Click on cards to flip them and reveal symbols
3. Find matching pairs - each match earns points
4. Wrong matches cost points, so memorize carefully!
5. Complete all pairs before time runs out for a time bonus
6. Try to beat your high score!

## Scoring

- **Match Bonus**: Earn points for each successful pair match
- **Wrong Match Penalty**: Lose points for incorrect matches
- **Time Bonus**: Remaining time × 10 if you complete the game

## Styling

This component uses CSS modules and Theme.css variables for consistent theming. See `MemoryMatch.module.css` (in the same folder) to customize visuals.