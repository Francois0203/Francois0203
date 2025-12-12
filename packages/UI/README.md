# @francois0203/ui

A personal UI component library built with React.

## Installation

```bash
npm install @francois0203/ui
```

## Usage

```jsx
import { ThemeSwitch, useTheme } from '@francois0203/ui';

function App() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
```

## Components

- ThemeSwitch
- Error Boundary
- Navigation Bar
- Toast Notifications
- Tooltip

## Hooks

- useTheme
- useTooltip

## Styles

Import the CSS files as needed.

```js
import '@francois0203/ui/dist/styles/Theme.css';
```