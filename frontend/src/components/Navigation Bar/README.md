# Navigation Bar

A responsive, dual-mode navigation component with a **liquid glass** design language. It automatically renders the correct variant based on viewport width:

- **Desktop** (`≥ 768 px`) — floating glass capsule, top-center of the screen
- **Mobile** (`< 768 px`) — floating radial launcher, bottom-center of the screen

Active state is driven by the **React Router `location`** — no `activeTab` prop is required in normal usage.

---

## Files

| File | Purpose |
|---|---|
| `NavigationBar.js` | Orchestrator — breakpoint detection, renders DesktopNav or MobileNav |
| `DesktopNav.js` | Floating capsule nav for wide screens |
| `DesktopNav.module.css` | Desktop styles |
| `MobileNav.js` | Radial arc launcher for narrow screens |
| `MobileNav.module.css` | Mobile styles |

---

## Desktop Navigation

A pill-shaped glass capsule fixed at the top-center of the viewport.

### Visual
- Frosted glass background (`--frosted-background`) with `backdrop-filter`
- **Border rim glow** — teal accent traces the cursor position around the pill edge via a CSS gradient-border trick
- **Ambient interior glow** — soft radial bloom follows the cursor horizontally across the capsule interior
- Subtle lift shadow that deepens on hover

### Links
- Ghost buttons — transparent background at rest
- Hover: `--accent-1-background` fill fades in, text brightens, button lifts 1 px
- Active: full tinted fill + inset accent ring + teal text + bold weight + indicator dot
- Active state resolves from the current router pathname, no prop needed

---

## Mobile Navigation

A circular glass button fixed at the bottom-center of the viewport. Tapping it expands into a radial arc of circular link bubbles.

### Visual
- Same liquid glass style as the desktop capsule
- **Cursor rim glow** on the trigger button when closed
- Full-screen blurred backdrop renders behind the arc when open (portalled to `<body>`)

### Interaction
- Trigger button: hamburger bars morph into an ✕ when open (spring animation)
- Links fan out in a **160° upward arc** with spring-stagger entry delays
- Each bubble shows a **Lucide icon** and an always-visible **frosted label** above it
- When there are more than 4 links, `‹` / `›` scroll arrows appear at the arc ends
- Swipe left/right on the container also rotates through overflow links
- Closes on outside click, Escape key, or after a link is tapped

### Built-in icon mapping

Labels are matched case-insensitively. Supply a custom `icon` prop on any link to override.

| Label | Icon |
|---|---|
| `home` | `LuHouse` |
| `bio` | `LuUser` |
| `projects` / `notable projects` | `LuBriefcase` |
| `contact` | `LuMail` |
| `code` | `LuCode` |
| _(anything else)_ | `LuHash` |

---

## Props

### `NavigationBar`

| Prop | Type | Default | Description |
|---|---|---|---|
| `links` | `array` | `[]` | Navigation link objects — see shape below |
| `onNavigate` | `function` | `() => {}` | Called with `(to, index)` when a link is clicked |
| `activeTab` | `string \| number \| null` | `null` | Fallback active indicator when no `link.to` is present |
| `burgerSize` | `number` | `56` | Mobile trigger diameter in px |
| `className` | `string` | `""` | Additional class on the root element (desktop only) |

### Link object shape

```js
{
  label: "Home",       // displayed text / aria-label
  to: "/",            // route path — used for active detection and navigation
  icon: LuHouse,      // optional — overrides the auto icon lookup on mobile
  onClick: () => {},  // optional — called before navigation
}
```

---

## Styling

All colours are resolved from **`Theme.css` variables only** — no hardcoded values. The component adapts automatically to light and dark themes via the existing `[data-theme="dark"]` overrides.

Key variables used:

| Variable | Usage |
|---|---|
| `--frosted-background` | Glass fill |
| `--border-color-hover` | Resting border |
| `--accent-1` | Glow, active ring, icons |
| `--accent-1-background` | Fill on hover / active |
| `--accent-1-rgb` | Ambient glow (rgba) |
| `--secondary-text-color` | Resting link text |
| `--primary-text-color` | Hovered link text |
| `--z-fixed`, `--z-modal`, `--z-modal-backdrop` | Stacking |

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