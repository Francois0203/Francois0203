# Tooltip

A flexible tooltip component with portal rendering and customizable positioning.

## Features

- Portal-based rendering for proper z-index handling
- Custom hook integration for positioning logic
- Support for heading and body content
- Accessible trigger elements
- Smooth hover interactions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | The trigger element for the tooltip |
| `content` | `string` | - | The main tooltip content |
| `heading` | `string` | - | Optional heading text for the tooltip |
| `className` | `string` | `''` | Additional CSS classes for the trigger |

## Usage

```jsx
import Tooltip from './components/Tooltip';

function HelpButton() {
  return (
    <Tooltip 
      heading="Help"
      content="Click here for assistance"
    >
      <button>?</button>
    </Tooltip>
  );
}
```