# Error Boundary

A React error boundary component that gracefully handles JavaScript errors in the component tree, preventing the entire application from crashing.

## Features

- Catches and logs JavaScript errors in child components
- Displays a user-friendly error UI with recovery options
- Supports custom error logging and reset callbacks
- Includes navigation buttons for home and retry actions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onError` | `function` | - | Optional callback function called when an error occurs, receives `(error, errorInfo)` |
| `onReset` | `function` | - | Optional callback function called when the error boundary is reset |
| `children` | `ReactNode` | - | The child components to wrap with error boundary protection |

## Usage

```jsx
import ErrorBoundary from './components/Error Boundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => console.error('Custom error logging:', error)}
      onReset={() => console.log('Error boundary reset')}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```