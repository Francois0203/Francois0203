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

## Pages

- Not Found

## Components

- ThemeSwitch
- Error Boundary
- Navigation Bar
- Toast Notifications
- Tooltip
- Loading
- Modal
- Searchable Select

## Hooks

- useTheme
- useTooltip
- useAnimations

## Styles

- Theme.css
- Components.css
- GeneralWrappers.css

```js
import '@francois0203/ui/dist/styles/Theme.css';
```