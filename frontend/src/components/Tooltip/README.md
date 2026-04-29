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
import { Tooltip } from '../../components';

function HelpButton() {
  return (
    <Tooltip heading="Help" content="Click here for assistance">
      <button>?</button>
    </Tooltip>
  );
}
```

## Notes

- Positioning and portal rendering are handled by the `useTooltip` hook internally — no position props needed.
- The trigger renders as an inline `<span>` with `cursor: help`.
- Arrow direction adapts to the placement detected by `useTooltip` (`top`, `bottom`, `left`, `right`).
- Reduced-motion: transition collapses to `opacity 120ms` only.
