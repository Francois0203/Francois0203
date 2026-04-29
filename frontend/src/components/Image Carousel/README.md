# ImageCarousel

Liquid-glass coverflow carousel with 3-D perspective, auto-play, and touch/keyboard support. Adjacent slides are visible at reduced scale and angle on each side of the active slide.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<{ src, alt, title?, caption? }>` | `[]` | Slide data array |
| `autoPlay` | `boolean` | `false` | Start in auto-play mode |
| `autoPlayInterval` | `number` | `4000` | Milliseconds between auto-advances |
| `showArrows` | `boolean` | `true` | Show previous/next arrow buttons |
| `showDots` | `boolean` | `true` | Show dot navigation below the stage |
| `aspectRatio` | `string` | `'16/9'` | CSS `aspect-ratio` value for the stage |
| `className` | `string` | `''` | Extra class on the root element |

## Usage

```jsx
import { ImageCarousel } from '../../components';

const slides = [
  { src: '/img/shot1.jpg', alt: 'Dashboard', title: 'Dashboard', caption: 'Main overview' },
  { src: '/img/shot2.jpg', alt: 'Editor',    title: 'Editor'    },
];

<ImageCarousel
  items={slides}
  autoPlay
  autoPlayInterval={5000}
  aspectRatio="4/3"
/>
```

## Notes

- Keyboard: `ArrowLeft` / `ArrowRight` navigate; `Space` toggles play/pause. The carousel root must be focused (click it or tab to it).
- Touch: horizontal swipe with a threshold of 40 px triggers navigation.
- Hovering the carousel pauses auto-play; it resumes when the cursor leaves.
- A thin accent progress bar at the bottom of the stage animates the remaining time during auto-play and resets on each slide change.
- Up to ±2 flanking slides are visible; slides beyond ±2 are hidden (`visibility: hidden`).
- The slide transition lock (560 ms) prevents rapid double-taps from skipping slides.
- Respects `prefers-reduced-motion` and `data-no-animations="true"` — transitions collapse to a simple opacity fade.
