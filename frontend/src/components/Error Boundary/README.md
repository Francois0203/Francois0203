# Error Boundary

Catches JavaScript errors anywhere in the child component tree, preventing app crashes. Displays an animated error UI with recovery options.

## Features

- Catches render, lifecycle, and constructor errors in the subtree
- Animated fallback UI — glow orbs, alert icon, collapsible technical details
- Reload and Go Home recovery buttons
- Resets automatically when `resetKey` changes (e.g. on route change)
- Full theme integration via `data-theme`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The component tree to protect |
| `fallbackPath` | `string` | `'/'` | Route to navigate to on "Go Home" |
| `navigate` | `function` | — | React Router `navigate` function — inject from a wrapper component |
| `onGoHome` | `function` | — | Called when the Go Home button is clicked |
| `resetKey` | `any` | — | Change this value to programmatically clear the error state (pass `location.pathname`) |

## Usage

The boundary requires React Router hooks (`useNavigate`, `useLocation`), so it must be rendered inside a `<BrowserRouter>`. The wrapper pattern used in `index.js` handles this automatically:

```jsx
// Already wired in index.js — use ErrorBoundary directly in the tree for nested boundaries
import { ErrorBoundary } from '../../components';

<ErrorBoundary
  fallbackPath="/"
  navigate={navigate}
  onGoHome={() => navigate('/')}
  resetKey={location.pathname}
>
  <YourComponent />
</ErrorBoundary>
```

## Architecture

`ErrorBoundaryInner` is a class component (required by React's error boundary API). The exported `ErrorBoundary` is a thin function wrapper that injects the current `theme` via `useTheme`, since hooks cannot run inside class components.
