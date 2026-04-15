# Navigation Bar

Responsive dual-mode navigation with a liquid glass design. Automatically renders the correct variant based on viewport width:

- **Desktop** (`\u2265 768 px`) \u2014 floating glass capsule, top-center of the viewport
- **Mobile** (`< 768 px`) \u2014 floating radial launcher, bottom-center of the viewport

Active state is driven by **React Router `location`** \u2014 no `activeTab` prop needed in normal usage.

---

## Files

| File | Purpose |
|---|---|
| `NavigationBar.js` | Orchestrator \u2014 breakpoint detection, renders DesktopNav or MobileNav |
| `DesktopNav.js` | Floating capsule nav for wide screens |
| `DesktopNav.module.css` | Desktop styles |
| `MobileNav.js` | Radial arc launcher for narrow screens |
| `MobileNav.module.css` | Mobile styles |

---

## Desktop Navigation

Pill-shaped glass capsule, fixed top-center. Border rim and ambient glow track the cursor.

- **Border rim glow** \u2014 accent traces cursor position around the pill via a CSS gradient-border trick
- **Ambient interior glow** \u2014 radial bloom follows cursor horizontally inside the capsule
- Links: transparent at rest \u2192 accent fill on hover \u2192 full tinted fill + accent ring + indicator dot when active

---

## Mobile Navigation

Circular glass trigger, fixed bottom-center. Tap to expand a radial arc of link bubbles.

- Hamburger bars morph to \u2715 when open (spring animation)
- Links fan into a **120\u00b0 upward arc** with stagger entry delays
- Each bubble has a **Lucide icon** and a frosted label above it
- More than 4 links: swipe left/right to scroll through overflow links
- Closes on outside click, Escape, or link tap

### Built-in icon mapping

Labels matched case-insensitively; supply `icon` prop to override.

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
| `links` | `array` | `[]` | Navigation link objects \u2014 see shape below |
| `onNavigate` | `function` | `() => {}` | Called with `(to, index)` on link click |
| `activeTab` | `string \| number \| null` | `null` | Fallback active indicator when no `link.to` is present |
| `burgerSize` | `number` | `56` | Mobile trigger diameter in px |
| `className` | `string` | `''` | Extra class on the root element (desktop only) |

### Link object shape

```js
{
  label:   'Home',       // display text / aria-label
  to:      '/',          // route path \u2014 drives active detection + navigation
  icon:    LuHouse,      // optional \u2014 overrides auto icon lookup on mobile
  onClick: () => {},     // optional \u2014 called before navigation
}
```

---

## Usage

```jsx
import NavigationBar from './components/Navigation Bar';

const navLinks = [
  { label: 'Home',     to: '/'        },
  { label: 'Bio',      to: '/bio'     },
  { label: 'Projects', to: '/projects'},
  { label: 'Contact',  to: '/contact' },
];

function App() {
  const navigate = useNavigate();
  return (
    <NavigationBar
      links={navLinks}
      onNavigate={(path) => navigate(path)}
    />
  );
}
```

---

## Styling

All colours from `Theme.css` variables \u2014 no hardcoded values. Adapts to light/dark via `[data-theme="dark"]`.

| Variable | Usage |
|---|---|
| `--frosted-background` | Glass fill |
| `--border-color-hover` | Resting border |
| `--accent-1` | Glow, active ring, bubble icons |
| `--accent-1-background` | Fill on hover / active |
| `--accent-1-rgb` | Ambient glow (rgba) |
| `--secondary-text-color` | Resting link text |
| `--primary-text-color` | Hovered link text |
| `--z-fixed`, `--z-modal`, `--z-modal-backdrop` | Stacking order |