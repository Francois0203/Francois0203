# Reduce Animations Switch

A premium glassmorphism toggle that enables or disables motion across the app. Uses the same visual language as `ThemeSwitch` for a consistent UI system.

## Visual Design

- **Animations on** (default) — thumb (lightning icon) on the left; pause icon visible in the right track area.
- **Animations reduced** — thumb (pause icon) slides to the right; lightning icon appears in the left track area.
- Frosted glass track with `backdrop-filter: blur`, sourced entirely from `Theme.css` variables.
- Spring-based cubic-bezier thumb animation (`0.34, 1.56, 0.64, 1`).

## Behavior

When toggled on, the component sets `data-no-animations="true"` on `<html>`. All transitions and animations in the project respond to this attribute:

```css
[data-no-animations='true'] * {
  transition: none !important;
  animation: none !important;
}
```

State is managed by the `useAnimations` hook (`src/hooks/useAnimations.js`), which also:
- Persists the preference to `localStorage` under `userSessionInfo.reduceAnimations`.
- Mirrors the OS `prefers-reduced-motion` setting when no stored preference exists.

## Props

None — the component is self-contained and pulls state from `useAnimations`.

## Usage

```jsx
import ReduceAnimationsSwitch from './components/Reduce Animations Switch';

// Render it anywhere; it manages its own state internally.
function SettingsPanel() {
  return <ReduceAnimationsSwitch />;
}
```

## How It Uses Theme.css

All styling uses global CSS variables — no hard-coded colors.

| Variable | Purpose |
|---|---|
| `--frosted-background` | Translucent track background |
| `--border-color` / `--border-color-hover` | Track border |
| `--background-1` / `--background-2` | Thumb gradient |
| `--accent-1` / `--accent-2` | Icon color, checked-state tint |
| `--accent-1-rgb` | RGBA accent overlays |
| `--tertiary-text-color` | Background icon color |
| `--shadow-sm` / `--shadow-md` | Track elevation shadows |
| `--transition-base` | Icon / border fade duration |
| `--radius-full` | Pill shape |

Both light and dark themes are handled automatically by `Theme.css` variable re-mapping.

## Accessibility

- `role="switch"` with `aria-checked` reflects the boolean `reduceAnimations` state.
- `aria-label` updates dynamically.
- Full keyboard support — `Enter` and `Space` activate the toggle.
- `:focus-visible` ring uses `--accent-1`.
- The component's own transitions are disabled when `prefers-reduced-motion: reduce` is active OR when `data-no-animations="true"` is set.

## Extending / Modifying

- **Icons** — swap `BsLightningFill` / `BsPauseFill` for any `react-icons` icons; the `.bgIconLeft`, `.bgIconRight`, `.thumbIcon` class structure stays the same.
- **Size** — change `width`, `height` on `.track` and update the thumb travel value (`translateX` = `track-width - 2×edge-padding - thumb-width`).
- **Shared hook** — to read `reduceAnimations` elsewhere in the app, import `useAnimations` from `src/hooks`.
