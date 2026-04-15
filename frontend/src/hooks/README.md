# Hooks

Custom React hooks for managing global application state and side effects.

---

## useAnimations

Manages the reduce-animations preference globally.

- Reads from `localStorage` (`userSessionInfo.reduceAnimations`); falls back to `prefers-reduced-motion`
- Toggles `data-no-animations` on `<html>` for CSS targeting
- Auto-mirrors OS preference changes when no explicit user choice is stored

**Returns:** `{ reduceAnimations, toggleAnimations }`

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
