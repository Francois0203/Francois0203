# Settings

Floating settings panel with a circular glass cog trigger. Opens a radial arc of setting bubbles fanning down-left from the top-right corner.

## Features

- Cog trigger with cursor-following rim glow when closed
- Theme (light/dark) and Motion (reduce animations) bubbles
- Portalled to `<body>` — never trapped by a parent stacking context
- Closes on outside click or Escape
- Full keyboard + ARIA support

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `theme` | `string` | — | `'light'` or `'dark'` |
| `toggleTheme` | `function` | — | Callback to toggle the theme |
| `cogSize` | `number` | `52` | Trigger diameter in px |
| `className` | `string` | `''` | Extra class on the container |

## Usage

```jsx
import Settings from './components/Settings';
import { useTheme } from './hooks';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Settings theme={theme} toggleTheme={toggleTheme} cogSize={52} />
  );
}
```

## Architecture

`BUBBLES` config array drives position (`tx`/`ty`) and stagger `delay` for each bubble. `ThemeBubble` and `AnimationsBubble` are separate sub-components so each owns its own state cleanly.
