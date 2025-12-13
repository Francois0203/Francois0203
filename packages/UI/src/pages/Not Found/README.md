# Not Found

An immersive 404 error page with a torch-light mechanic set in complete darkness. Users must move their cursor (as a torch) to reveal hidden content scattered across the page.

## Features

- **Torch Mechanic**: Canvas-based radial gradient that follows the cursor, creating a spotlight effect that reveals content only when the cursor passes over it
- **Christian-Themed Messages**: Thoughtful biblical references that tie the "lost" concept to spiritual themes
  - Psalm 23:4 - "Even though I walk through the valley of the shadow..."
  - John 8:12 - "I am the light of the world"
- **Hidden Navigation**: The "Return to Light" button starts nearly invisible and only becomes fully visible when discovered with the torch
- **Smart and Minimalistic**: Content is strategically placed across the page for users to discover
- **Full Dark Mode**: Completely black background with all content hidden until revealed
- **Responsive Design**: Adapts content placement and visibility for different screen sizes
- **Accessibility**: Reduced motion support and semantic HTML

## Layout

Content is positioned strategically across the page:
- **Top Left**: Psalm 23:4 verse
- **Center**: "You're Lost but not forsaken" main message
- **Right**: Large "404" watermark
- **Bottom Center**: Hint text and the hidden navigation button
- **Bottom Right**: John 8:12 verse

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| None | - | - | This component doesn't accept props |

## Usage

```jsx
import NotFound from './pages/Not Found';

function App() {
  return (
    <div>
      <NotFound />
    </div>
  );
}
```

## Technical Implementation

- Uses HTML5 Canvas with requestAnimationFrame for smooth torch rendering
- Radial gradient creates the spotlight effect with falloff
- React hooks (useEffect, useRef, useState) manage animation and state
- CSS cursor: none hides the default cursor for full immersion
- Button visibility state tracks whether user has discovered the navigation

## Behavior

1. Page loads with complete darkness
2. User moves cursor, which acts as a torch revealing content
3. When cursor hovers over the "Return to Light" button, it gains a glowing effect
4. Clicking the button navigates back in history, or to home if no history exists