# Tooltip

Portal-based tooltip with optional heading and body content. Positioning and visibility are handled by the `useTooltip` hook.

## Features

- Portal rendering for correct z-index at any DOM depth
- Separate heading and content slots
- Smooth hover interactions via `useTooltip`
- Passes through all native `<span>` attributes to the trigger

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The trigger element |
| `content` | `string` | — | Main tooltip body text |
| `heading` | `string` | — | Optional bold heading |
| `className` | `string` | `''` | Extra class on the trigger span |

## Usage

```jsx
import Tooltip from './components/Tooltip';

function HelpButton() {
  return (
    <Tooltip heading="Help" content="Click here for assistance">
      <button>?</button>
    </Tooltip>
  );
}
```
