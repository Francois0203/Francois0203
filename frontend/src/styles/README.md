# Design System — Styles

This directory contains the two foundational CSS files that define the visual language for the entire application. Together they form a minimal, professional design system with a turquoise accent identity — inspired by the aesthetic of Stripe, Linear, and Vercel.

---

## Philosophy

- **Neutral-first.** Backgrounds, surfaces, and text are built from a cool-gray scale. Color is used sparingly and intentionally.
- **Single accent.** Turquoise (`--accent-1`) is the only brand color. It is used for interactive states (focus rings, links, primary buttons) and nothing else.
- **No visual noise.** No gradient text, no glow effects, no large transforms on hover. Motion is subtle — only opacity, background, border, and shadow transitions.
- **Accessible by default.** All contrast ratios target WCAG AA. Focus states are always visible. Disabled states are clearly communicated.

---

## File Overview

### `Theme.css`

Defines all CSS custom properties (variables). It is the single source of truth for every value used in the UI.

**Sections:**

| Section | Variables |
|---|---|
| Typography | `--font-size-*` |
| Spacing | `--spacing-*` |
| Border Radius | `--radius-*` |
| Transitions | `--transition-*` |
| Shadows | `--shadow-*` |
| Z-Index | `--z-*` |
| Color Palette | All color variables (light/dark mode) |
| Applied Variables | Global tokens that Components.css consumes |

**Color structure:**

```
--{token}-light   → light mode value
--{token}-dark    → dark mode value
--{token}         → applied value (defaults to light, overridden by [data-theme="dark"])
```

Dark mode is activated by setting `data-theme="dark"` on the `<html>` or `<body>` element.

---

### `Components.css`

Styles all base HTML elements and provides utility classes. It consumes only variables from `Theme.css` — no hardcoded colors, spacing, or radius values.

**Sections (in order):**

1. Base (`body`)
2. Typography (`h1`–`h6`, `p`)
3. Links (`a`)
4. Lists (`ul`, `ol`, `li`)
5. Buttons (`button` + variants)
6. Labels (`label`)
7. Form Inputs — base (`input`, `textarea`, `select`)
8. Text Inputs (all `type=` variants)
9. Textarea
10. Select
11. Checkbox
12. Radio
13. Date & Time Inputs
14. File Input
15. Range Slider
16. Fieldset & Legend
17. Details & Summary
18. Table
19. Code & Pre
20. Blockquote
21. Dialog
22. Progress
23. Meter
24. Output
25. Mark, Kbd, Abbr
26. Figure & Figcaption
27. Images
28. HR
29. Scrollbar
30. Focus (global `*:focus-visible`)
31. Selection (`::selection`)
32. Utility Classes

---

## Naming Conventions

### Variables (`Theme.css`)

```css
--{property}-{scale}         /* e.g. --font-size-lg, --spacing-md */
--{token}-{mode}             /* e.g. --accent-1-light, --background-2-dark */
--{token}                    /* applied alias e.g. --accent-1, --background-2 */
```

### Button Variants (`Components.css`)

| Class | Role |
|---|---|
| *(default)* | Primary — turquoise fill |
| `.btn-secondary` | Neutral surface |
| `.btn-outline` | Turquoise border, transparent fill |
| `.btn-ghost` | No border, minimal |
| `.btn-danger` | Destructive action |
| `.btn-success` | Confirmatory action |

---

## Extending the System

### Adding a new color token

1. Define the light and dark values in `Theme.css` following the existing pattern:
   ```css
   --my-token-light: #value;
   --my-token-dark:  #value;
   ```
2. Add the applied alias at the bottom of `:root`:
   ```css
   --my-token: var(--my-token-light);
   ```
3. Override it inside `[data-theme="dark"]`:
   ```css
   --my-token: var(--my-token-dark);
   ```

### Adding a new component style

- Use only variables from `Theme.css`. Never hardcode colors, spacing, or radius.
- Follow the existing transition pattern: `var(--transition-fast)` for hover/focus, `var(--transition-base)` for larger changes.
- Keep hover states subtle — prefer background/border color shifts over transforms.
- Add a focus-visible state using `outline: 2px solid var(--accent-1)`.

---

## Best Practices

- Import `Theme.css` before `Components.css` — variables must be defined first.
- Do not override variables inline on elements. Add new tokens to `Theme.css` instead.
- Use `--accent-1` sparingly. It should draw the eye to the single most important interactive element in view.
- Use `--background-2` / `--background-3` for elevated surfaces, not additional colors.
- Prefer `var(--transition-fast)` for micro-interactions (hover, focus). Reserve `var(--transition-slow)` for layout or theme changes.
- Always test both light and dark modes when adding new styles.
