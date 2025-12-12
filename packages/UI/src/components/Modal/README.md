# Modal

A flexible modal dialog component with overlay, keyboard navigation, and customizable content.

## Features

- Click-outside-to-close functionality
- ESC key support for closing
- Customizable title and content
- Accessible with proper ARIA labels
- Smooth overlay transitions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls whether the modal is visible |
| `onClose` | `function` | - | Callback function called when the modal should close |
| `children` | `ReactNode` | - | The content to display inside the modal |
| `title` | `string` | - | Optional title text displayed at the top of the modal |

## Usage

```jsx
import Modal from './components/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        title="My Modal"
      >
        <p>This is the modal content.</p>
      </Modal>
    </>
  );
}
```