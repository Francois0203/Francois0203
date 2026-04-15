# Loading

Fullscreen liquid glass loading screen. Six physics-driven blobs drift and repel each other continuously across the viewport. Cycles through Bible verses while loading.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | `'Loading'` | Text shown above the dot row |
| `showVerse` | `boolean` | `true` | Whether to display the cycling verse block |

---

## Background Physics

Six blobs (3 ambient glow + 3 glass) driven by a JS physics engine:
- Continuous drift with velocity damping (`DAMPING: 0.999`, `MAX_SPEED: 20 px/s`)
- Soft pair repulsion — prevents overlap without hard collisions
- Hard viewport clamp — blobs never escape the screen
- Minimum drift — blobs never come to a full stop
- Periodic nudges every 2.2–5.4 s — prevents repeating patterns
- Glass blobs (indices 3–5) track cursor via `--cursor-x` / `--cursor-y` CSS vars

Blob sizes scale down on mobile (`< 400 px`: 38%, `< 600 px`: 57%).

---

## Verse Cycling

Verses sourced from `src/data/verses.json`. Cycles every 7 seconds with a 500 ms cross-fade.

---

## Usage

```jsx
import Loading from './pages/Loading';

// With verse
<Loading message="Loading" />

// Without verse
<Loading message="Please wait" showVerse={false} />
```


Perfect for Christian applications, devotionals, Bible study apps, and faith-based experiences!