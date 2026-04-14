# Theme Switch

A premium glassmorphism toggle that switches between light and dark themes. The sliding thumb carries the active mode icon, and the opposite icon fades into the track to show what clicking will switch to.

## Visual Design

- **Light mode** — thumb (sun icon) on the left; moon icon visible in the right track area.
- **Dark mode** — thumb (moon icon) slides to the right; sun icon appears in the left track area.
- Frosted glass track with `backdrop-filter: blur`, sourced entirely from `Theme.css` variables.
- Spring-based cubic-bezier thumb animation (`0.34, 1.56, 0.64, 1`).

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `theme` | `'light' \| 'dark'` | ✓ | Current active theme |
| `toggleTheme` | `function` | ✓ | Callback to toggle the theme |

## Usage

```jsx
import ThemeSwitch from './components/Theme Switch';
import { useTheme } from './hooks';

function Header() {
  const { theme, toggleTheme } = useTheme();
  return <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />;
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

The `[data-theme="dark"]` override in `Theme.css` automatically re-maps all variables, so the component adapts without any conditional CSS.

## Accessibility

- `role="switch"` with `aria-checked` reflects the boolean state.
- `aria-label` updates dynamically: *"Switch to light mode"* / *"Switch to dark mode"*.
- Full keyboard support — `Enter` and `Space` activate the toggle.
- `:focus-visible` ring uses `--accent-1`.
- Transitions are disabled when `prefers-reduced-motion: reduce` is set **or** when the app sets `data-no-animations="true"` on `<html>`.

## Extending / Modifying

- **Size** — change `width`, `height` on `.track` and adjust `.thumb` size + travel (`translateX` value = `track-width - 2×padding - thumb-width`).
- **Icons** — swap `FaSun` / `FaMoon` for any `react-icons` icon; the structure (`.bgIconLeft`, `.bgIconRight`, `.thumbIcon`) stays the same.
- **Colors** — update the relevant variables in `Theme.css`; the component picks them up automatically.
