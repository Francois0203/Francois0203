# Theme Switch

A sleek toggle button component for switching between light and dark themes with smooth animations.

## Features

- Animated theme toggle with sun/moon icons
- Press feedback animation
- Accessible with proper ARIA labels
- Customizable button size
- Integrates with theme context

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `string` | - | Current theme ('light' or 'dark') |
| `toggleTheme` | `function` | - | Function to toggle between themes |
| `size` | `string` | `'3em'` | Size of the toggle button |

## Usage

```jsx
import ThemeSwitch from './components/Theme Switch';

function Header({ currentTheme, onThemeChange }) {
  return (
    <header>
      <h1>My App</h1>
      <ThemeSwitch 
        theme={currentTheme}
        toggleTheme={onThemeChange}
        size="2.5em"
      />
    </header>
  );
}
```