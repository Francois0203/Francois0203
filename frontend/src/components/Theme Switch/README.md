# Theme Switch

Glassmorphism toggle for switching between light and dark themes.

## Visual Design

- **Light mode** — thumb (sun) left; moon visible in right track area.
- **Dark mode** — thumb (moon) right; sun visible in left track area.
- Frosted glass track with `backdrop-filter: blur`, entirely from `Theme.css` variables.
- Spring cubic-bezier thumb animation (`0.34, 1.56, 0.64, 1`).

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

- `role="switch"` with `aria-checked` reflecting boolean state.
- `aria-label` updates dynamically.
- Full keyboard support — `Enter` and `Space` activate the toggle.
- `:focus-visible` ring uses `--accent-1`.
- Transitions disabled when `prefers-reduced-motion` or `data-no-animations="true"` is set.

