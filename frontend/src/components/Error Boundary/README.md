# Error Boundary

Catches JavaScript errors anywhere in the child component tree, preventing app crashes. Displays an animated error UI with recovery options.

## Features

- Catches render, lifecycle, and constructor errors in the subtree
- Animated fallback UI — particles, glow orbs, alert icon
- Collapsible technical details (error message + component stack)
- Reload and Go Home recovery buttons
- `data-theme` applied for full theme integration

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The component tree to protect |
| `onReset` | `function` | `window.location.reload()` | Override the Reload action |

## Usage

```jsx
import ErrorBoundary from './components/Error Boundary';

function App() {
  return (
    <ErrorBoundary onReset={() => resetAppState()}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Architecture

`ErrorBoundaryInner` is a class component (required by React's error boundary API). `ErrorBoundary` is a thin function wrapper that injects the current `theme` value via `useTheme`, since hooks cannot run inside class components.
