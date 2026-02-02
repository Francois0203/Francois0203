# Navigation Bar

A Christian-themed navigation bar featuring the Cross icon with halo and shine effects, integrated with the 7 pieces of Armor of God from Ephesians 6:10-18.

## Features

- **Cross Icon Button**: FaCross from react-icons with halo on top and 3 shine lines
- **Armor of God Theme**: Each of the 7 main links represents a piece of spiritual armor
- **Vertical Dropdown**: Links stack vertically for clean, modern appearance  
- **Minimalistic Design**: Clean styling with subtle animations and Christian symbolism
- **Background Decoration**: Floating armor icons in the background
- **Responsive**: Optimized for all screen sizes
- **No Sublinks**: Simplified navigation with direct links only

## The 7 Pieces of Armor

1. **Belt of Truth** - Stand firm with truth
2. **Breastplate of Righteousness** - Protected by righteousness  
3. **Shoes of Peace** - Walk in peace
4. **Shield of Faith** - Faith protects us
5. **Helmet of Salvation** - Salvation guards our minds
6. **Sword of the Spirit** - The Word of God
7. **Prayer** - Pray in the Spirit

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `links` | `array` | - | Array of navigation link objects (max 7) with `label`, `to`, and `onClick` |
| `onNavigate` | `function` | - | Callback function called when navigating to a link |
| `burgerSize` | `number` | `44` | Size of the cross icon button in pixels |
| `className` | `string` | `''` | Additional CSS class names for styling |

## Usage

```jsx
import NavigationBar from './components/Navigation Bar';

const navLinks = [
  { label: 'Home', to: '/', onClick: () => {} },
  { label: 'About', to: '/about', onClick: () => {} },
  { label: 'Sermons', to: '/sermons', onClick: () => {} },
  { label: 'Prayer', to: '/prayer', onClick: () => {} },
  { label: 'Community', to: '/community', onClick: () => {} },
  { label: 'Resources', to: '/resources', onClick: () => {} },
  { label: 'Contact', to: '/contact', onClick: () => {} }
];

function App() {
  return (
    <NavigationBar 
      links={navLinks}
      onNavigate={(path) => window.location.href = path}
      burgerSize={44}
    />
  );
}
```

## Styling

The component uses CSS modules and integrates with the Theme.css color scheme:
- `--accent-1`, `--accent-2`: For icon colors and highlights
- `--warning-color`: For the golden halo and shine effects
- `--background-1`, `--background-2`: For the dropdown background
- Smooth transitions and hover effects throughout

## Dependencies

- `react-icons/fa` - For FaCross icon
- `react-icons/gi` - For Armor of God icons (GiShield, GiChestArmor, etc.)