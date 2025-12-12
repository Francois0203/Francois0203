# Loading

A simple and elegant loading component that displays an animated spinner with customizable message text.

## Features

- Animated four-dot loading indicator
- Customizable loading message
- Responsive design with centered layout
- Integrates with theme system for consistent styling

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `'Loading...'` | The text to display below the loading animation |

## Usage

```jsx
import Loading from './components/Loading';

function MyComponent({ isLoading }) {
  if (isLoading) {
    return <Loading message="Fetching data..." />;
  }
  
  return <div>Data loaded!</div>;
}
```