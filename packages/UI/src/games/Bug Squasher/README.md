# Bug Squasher

A small, lightweight clickable bug-squashing mini-game component used by the UI package.

Features
- Simple spawn and move behavior for bugs
- Score counter and countdown timer
- Customizable duration and bug limit

Props
- `duration` (number) — game length in milliseconds (default: `30000`)
- `onComplete` (function) — optional callback called with final score when the game ends
- `bugLimit` (number) — maximum simultaneous bugs (default: `6`)

Usage

Import the component and render it in your app:

```jsx
import BugSquasher from 'packages/UI/src/games/Bug Squasher';

function App() {
	return (
		<BugSquasher
			duration={20000}
			bugLimit={8}
			onComplete={score => console.log('Final score:', score)}
		/>
	);
}
```

Styling

This component uses CSS modules. See `BugSquasher.module.css` (in the same folder) to customize visuals.