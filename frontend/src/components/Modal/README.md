# Modal

Liquid-glass modal dialog with full accessibility support — focus trapping, scroll lock, keyboard navigation.

## Features

- Focus trapped inside dialog while open; restored to opener on close
- Scroll locked on `<body>` with scrollbar-width compensation
- Escape closes; backdrop click closes; Tab wraps at both ends
- Optional title renders a labelled `<header>`
- `aria-modal`, `role="dialog"`, `aria-labelledby` wired up correctly

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controls visibility |
| `onClose` | `function` | — | Called when the modal should close |
| `children` | `ReactNode` | — | Modal body content |
| `title` | `string` | — | Optional heading text |

## Usage

```jsx
import Modal from './components/Modal';

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
