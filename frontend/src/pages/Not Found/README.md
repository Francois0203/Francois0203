# Not Found

404 page with a liquid glass aesthetic. Six physics-driven squares (3 ambient glow + 3 glass lenses) rotate and drift across the viewport. A central card cycles through funny developer sayings every 9 seconds.

---

## Features

- Physics blob field identical to the Connect and Loading pages
- Glass squares include rotation (`rotSpeed` in `BLOB_DEFS`)
- Funny saying cycles every 9 s with a 500 ms cross-fade
- Two navigation actions: **Go Home** (`/`) and **Go Back** (history or fallback `/`)

---

## Data Source

Sayings sourced from `src/data/notfound.json` (`sayings` array, each entry has `text` and `attribution`).

---

## Props

None — this page takes no props.

---

## Usage

```jsx
import NotFound from './pages/Not Found';

// In your router
<Route path="*" element={<NotFound />} />
```
