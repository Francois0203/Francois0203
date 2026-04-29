# Modal

Liquid-glass modal dialog with full accessibility support — focus trapping, scroll lock, keyboard navigation.

## Features

- Focus trapped inside dialog while open; restored to opener on close
- Scroll locked on `<body>` with scrollbar-width compensation
- Escape closes; backdrop click closes; Tab wraps at both ends
- Optional title renders a labelled `<header>`
- `aria-modal`, `role="dialog"`, `aria-labelledby` wired up correctly
- Mobile (≤ 480 px): snaps to bottom of screen as a bottom sheet, slides up on entry

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controls visibility |
| `onClose` | `function` | — | Called when the modal should close |
| `children` | `ReactNode` | — | Modal body content |
| `title` | `string` | — | Optional heading text |

## Usage

```jsx
import { Modal } from '../../components';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onClose={() => setOpen(false)} title="My Modal">
        <p>Modal content here.</p>
      </Modal>
    </>
  );
}
```

## Notes

- Respects `prefers-reduced-motion` — entry/exit animations are disabled.
- The backdrop scrim is `rgba(0, 0, 0, 0.45)` — intentionally neutral, not an accent color.
- Body scrollbar width is compensated on open to prevent layout shift.
- `max-height` is capped at `85dvh` (desktop) / `92vh` (mobile); body content scrolls independently.
