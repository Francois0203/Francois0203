# Custom Buttons

Three liquid-glass button variants with progressive interaction complexity. Choose the one that fits the visual weight required by the context.

---

## CursorGlowButton

A frosted-glass button where a radial glow tracks the cursor inside the button and along its border, using RAF + lerp for smooth animation.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Button label or content |
| `onClick` | `function` | — | Click handler |
| `disabled` | `boolean` | `false` | Disables interaction and dims the button |
| `type` | `string` | `'button'` | Native button `type` attribute |
| `className` | `string` | `''` | Additional class names merged onto the root `<button>` |

### Usage

```jsx
import { CursorGlowButton } from '../../components';

<CursorGlowButton onClick={() => console.log('clicked')}>
  Save changes
</CursorGlowButton>
```

### Notes

- Glow position is tracked via `--glow-x` / `--glow-y` CSS custom properties set through `style.setProperty` — no React state re-renders during mouse move.
- `overflow: hidden` is intentionally absent so the glow bleeds slightly past the button edge for ambient area illumination.
- The `::before` pseudo-element draws a reactive gradient border using the CSS mask punch-out technique.
- Cleans up the RAF loop on unmount.

---

## LightWaveButton

A pure-CSS ghost button with an accent-tinted glass fill that slides in from the left on hover, creating a "light wave" sweep effect. No JavaScript required.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Button label or content |
| `onClick` | `function` | — | Click handler |
| `disabled` | `boolean` | `false` | Disables interaction and dims the button |
| `type` | `string` | `'button'` | Native button `type` attribute |
| `className` | `string` | `''` | Additional class names merged onto the root `<button>` |

### Usage

```jsx
import { LightWaveButton } from '../../components';

<LightWaveButton onClick={() => console.log('clicked')}>
  Learn more
</LightWaveButton>
```

### Notes

- Uses `overflow: hidden` to clip the sliding `::before` fill to the button shape.
- The fill includes its own `backdrop-filter` for a layered frosted effect on hover.
- No JS event listeners — fully CSS-driven animation.

---

## MagneticButton

A solid accent-colored button that magnetically follows the cursor using RAF + lerp. Most visually prominent of the three — use for primary CTAs.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Button label or content |
| `onClick` | `function` | — | Click handler |
| `disabled` | `boolean` | `false` | Disables magnetic pull and dims the button |
| `type` | `string` | `'button'` | Native button `type` attribute |
| `className` | `string` | `''` | Additional class names merged onto the root `<button>` |

### Usage

```jsx
import { MagneticButton } from '../../components';

<MagneticButton onClick={() => console.log('clicked')}>
  Get started
</MagneticButton>
```

### Notes

- Magnetic transform is applied via `--mag-x` / `--mag-y` CSS custom properties — no React state updates during mouse move.
- Inner content has a 1.4× parallax offset via `--inner-x` / `--inner-y` for depth.
- No cursor glow or particle effects — kept intentionally minimal.
- On cursor leave the button springs back with a 480 ms cubic-bezier ease; on hover it tightens to 90 ms for responsive tracking.
- Cleans up the RAF loop on unmount.
- `disabled` disables the transform and filter entirely via CSS.
