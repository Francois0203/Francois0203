# Hooks

Custom React hooks for managing global application state, data fetching, and UI side effects.

---

## useAnimations

Manages the reduce-animations preference globally.

- Reads from `localStorage` (`userSessionInfo.reduceAnimations`); falls back to `prefers-reduced-motion`
- Toggles `data-no-animations` on `<html>` for CSS targeting
- Auto-mirrors OS preference changes when no explicit user choice is stored

**Returns:** `{ reduceAnimations, toggleAnimations }`

---

## usePortfolioData

Fetches all portfolio content from Firestore in a single parallel call.

- Loads all sections (`personal`, `contact`, `social`, `donation`, `skills`, `interests`, `experience`, `education`, `projects`) simultaneously via `Promise.all`
- Returns a loading state while the fetch is in progress
- Returns an error state if Firestore is unreachable

**Returns:** `{ data, loading, error }`

```jsx
import { usePortfolioData } from '../hooks';

const { data, loading, error } = usePortfolioData();

if (loading) return <Loading />;
if (error)   return <p>Failed to load.</p>;

const { personal, experience, projects } = data;
```

To fetch only a specific section, import the individual Firestore helper directly instead:

```js
import { getExperience } from '../firebase/firestore';
```

---

## useTheme

Manages the light/dark theme globally.

- Reads from `localStorage` (`userSessionInfo.prefersColorScheme`); falls back to `prefers-color-scheme`
- Sets `data-theme` on `<html>` with every change
- Auto-mirrors OS preference changes when no explicit user choice is stored

**Returns:** `{ theme, toggleTheme, setTheme }`

---

## useTooltip

Manages tooltip visibility, animated entry/exit, and viewport-aware placement.

- Auto-resolves placement: right → left → bottom → top, clamped with 12 px margin
- Portals the tooltip to `<body>` for correct z-index stacking
- Smooth CSS class-based enter/exit animations (220 ms exit delay)
- Repositions on `resize` and `scroll` while visible

**Returns:** `{ triggerProps, TooltipPortal, isVisible, placement }`
