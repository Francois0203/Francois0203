# Reduce Animations Switch

Glassmorphism toggle for enabling or disabling motion across the app. Uses the same visual language as `ThemeSwitch`.

## Visual Design

- **Animations on** (default) — thumb (lightning) left; pause icon visible right.
- **Animations reduced** — thumb (pause) right; lightning icon visible left.
- Frosted glass track with `backdrop-filter: blur`, entirely from `Theme.css` variables.
- Spring cubic-bezier thumb animation (`0.34, 1.56, 0.64, 1`).

## Behavior

When enabled, sets `data-no-animations="true"` on `<html>`. All CSS responds to this attribute:

```css
[data-no-animations='true'] * {
  transition: none !important;
  animation: none !important;
}
```

State managed by `useAnimations` (`src/hooks/useAnimations.js`) which also:
- Persists to `localStorage` under `userSessionInfo.reduceAnimations`.
- Mirrors OS `prefers-reduced-motion` when no stored preference exists.

## Props

None — self-contained, state managed by `useAnimations`.

## Usage

```jsx
import { ReduceAnimationsSwitch } from '../../components';

function SettingsPanel() {
  return <ReduceAnimationsSwitch />;
}
```

## Theme.css Variables Used

| Variable | Purpose |
|---|---|
| `--frosted-background` | Track fill |
| `--border-color` / `--border-color-hover` | Track border |
| `--background-1` / `--background-2` | Thumb gradient |
| `--accent-1` / `--accent-2` | Icon color, checked-state tint |
| `--accent-1-rgb` | RGBA accent overlays |
| `--tertiary-text-color` | Background icon color |
| `--shadow-sm` / `--shadow-md` | Track elevation |
| `--radius-full` | Pill shape |

## Accessibility

- `role="switch"` + `aria-checked` reflect `reduceAnimations` state.
- `aria-label` updates dynamically.
- `Enter` and `Space` activate the toggle.
- `:focus-visible` ring uses `--accent-1`.

