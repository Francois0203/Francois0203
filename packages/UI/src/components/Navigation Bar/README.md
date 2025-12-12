# Navigation Bar

A modern, responsive navigation bar component with burger menu, dropdown submenus, and smooth hover effects.

## Features

- Responsive burger menu for mobile devices
- Hierarchical navigation with sublinks
- Hover-based submenu expansion on desktop
- Customizable burger menu size
- Smooth animations and transitions
- Touch-friendly mobile interactions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `links` | `array` | - | Array of navigation link objects with `label`, `to`, `onClick`, and optional `subLinks` |
| `onNavigate` | `function` | - | Callback function called when navigating to a link |
| `burgerSize` | `number` | `44` | Size of the burger menu button in pixels |
| `className` | `string` | `''` | Additional CSS class names for styling |

## Usage

```jsx
import NavigationBar from './components/Navigation Bar';

const navLinks = [
  { label: 'Home', to: '/' },
  { 
    label: 'Products', 
    subLinks: [
      { label: 'Product A', to: '/products/a' },
      { label: 'Product B', to: '/products/b' }
    ]
  }
];

function App() {
  return (
    <NavigationBar 
      links={navLinks}
      onNavigate={(path) => console.log('Navigate to:', path)}
    />
  );
}
```