# Settings

A modern, animated settings dropdown component with a cog icon that opens a menu of configurable options, including theme switching.

## Features

- **Cog Icon**: Animated gear icon that rotates on hover and when menu is open
- **Smooth Animations**: Dropdown appears with scale and fade transitions
- **Background Decorations**: Rotating gear decorations for visual appeal
- **Hover Effects**: Interactive hover states with transforms and glows
- **Theme Switching**: Integrated theme toggle functionality
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Theme Integration**: Uses CSS custom properties for theming

## Usage

```jsx
import { Settings } from '@francois0203/ui';
import { IoColorWandSharp } from 'react-icons/io5';

const settingsOptions = [
  { icon: IoColorWandSharp, name: "Theme", description: "Change appearance", type: "theme" },
];

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSettingSelect = (setting, index) => {
    console.log('Selected:', setting.name);
  };

  return (
    <Settings
      options={settingsOptions}
      onSettingSelect={handleSettingSelect}
      theme={theme}
      toggleTheme={toggleTheme}
      cogSize={44}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array` | `SETTINGS_OPTIONS` | Array of setting objects with `icon`, `name`, `description`, and optional `type` |
| `onSettingSelect` | `Function` | - | Callback when a setting is clicked (not called for theme type) |
| `theme` | `string` | - | Current theme ('light' or 'dark') |
| `toggleTheme` | `Function` | - | Function to toggle between light and dark themes |
| `cogSize` | `number` | `44` | Size of the cog button in pixels |
| `className` | `string` | `""` | Additional CSS classes |

## Setting Object Structure

```javascript
{
  icon: IoColorWandSharp,        // React icon component (from react-icons) OR string/emoji
  name: "Theme",          // Display name
  description: "Change appearance",  // Tooltip/description
  type: "theme"           // Optional: special handling for theme settings
}
```

## Styling

The component uses CSS modules and integrates with the theme system. Key CSS custom properties used:

- `--accent-1`: Primary accent color
- `--accent-2`: Secondary accent color
- `--background-1`, `--background-2`, `--background-3`: Background gradients
- `--primary-text-color`: Text color
- `--font-size-base`: Base font size

## Dependencies

- `react-icons` (peer dependency)
- React 19+