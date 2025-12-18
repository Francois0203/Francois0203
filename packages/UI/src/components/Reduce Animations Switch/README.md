# Reduce Animations Switch

Small UI component that toggles animation reduction across the app by setting the
`data-no-animations` attribute on the document root (`<html>`).

- Location: `src/components/Reduce Animations Switch`
- Story: `.storybook/stories/components/ReduceAnimationsSwitch.stories.js`

Usage
- Import from the package root: `import { ReduceAnimationsSwitch } from '.../src'`
- Props: `size` (number) — icon size in px, default `22`.

Behavior
- When toggled ON the component sets `data-no-animations="true"` on the document
  root. The project's `Theme.css` contains a rule that disables transitions and
  animations when that attribute is present: `[data-no-animations="true"] * { transition: none !important; animation: none !important; }`.
- The preference is persisted to `localStorage` using the key `reduceAnimations`.

Accessibility
- Uses `role="button"`, `aria-pressed`, and `aria-label` for keyboard & screen reader support.

Notes
- To reset the setting, clear the `reduceAnimations` key from `localStorage` or toggle the switch in UI.
