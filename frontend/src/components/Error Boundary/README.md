# Error Boundary

Catches JavaScript errors anywhere in the child component tree, preventing app crashes. Displays a themed fallback UI with graduated recovery options.

## Features

- Catches render, lifecycle, and constructor errors in the subtree
- Fallback UI: alert icon, message, and a collapsible "Technical details" panel
- Three recovery actions, cheapest first: **Try again** (soft re-render, no reload), **Reload**, **Go home**
- Resets automatically when `resetKey` changes (e.g. on route change)
- Self-contained: no required props and no router dependency - themes itself from the `:root` CSS variables

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | The component tree to protect |
| `resetKey` | `any` | - | When this value changes, the error state clears automatically. Pass `location.pathname` so navigating away recovers on its own. |
| `onError` | `(error, errorInfo) => void` | - | Optional callback for logging / error reporting |

## Usage

Drop it in anywhere - no wiring required:

```jsx
import { ErrorBoundary } from '../../components';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

To auto-recover on navigation (as wired in `index.js`), pass the current path:

```jsx
const location = useLocation();

<ErrorBoundary resetKey={location.pathname}>
  <App />
</ErrorBoundary>
```

## Architecture

A single class component (React's error boundary API requires a class). "Go home" and "Reload" use `window.location`, so the boundary needs no `navigate` prop and works even when the router itself is the thing that failed. "Try again" simply clears the error state to re-mount the children in place.
