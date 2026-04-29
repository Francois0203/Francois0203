# BlobCharacter

An animated glass blob with cursor-tracking eyes, used on the Not Found page.

## Props

| Prop        | Type   | Default | Description                          |
|-------------|--------|---------|--------------------------------------|
| `className` | string | `''`    | Extra class names merged onto the blob root |
| `style`     | object | —       | Inline styles passed to the blob root |

## Usage

```jsx
import BlobCharacter from './components/Blob Character/BlobCharacter';

<BlobCharacter />

// With size override
<BlobCharacter style={{ '--blob-size': '200px' }} />
```

## Notes

- **Eye tracking** — pupils follow the cursor via a `requestAnimationFrame` loop using exponential lerp (`LERP_EYES = 0.12`). Maximum pupil travel is clamped to 9 px from the socket centre.
- **Surface glow** — hovering the blob sets `--glow-x`, `--glow-y`, and `--glow-opacity` CSS custom properties on the root element; the `::before` border-ring and `.surfaceGlow` layer respond to these values with an accent-tinted radial gradient.
- **Shape animation** — `blobMorph` (13 s) continuously reshapes the border-radius; `blobFloat` (7 s) adds a gentle vertical drift. Both run independently with no JS involvement.
- **Sizing** — controlled by the `--blob-size` CSS custom property (default `150px`). Override via the `style` prop.
- **Accessibility** — root element carries `aria-hidden="true"`; the blob is purely decorative.
- **Theme tokens** — surface colours reference `--accent-1-rgb`, `--accent-2-rgb`, `--accent-3-rgb`, and `--shadow-md` from `Theme.css`. No hardcoded colour values.
