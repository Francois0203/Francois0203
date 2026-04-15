# Connect Page

Fullscreen contact page with physics-driven glass triangle blobs drifting in the background. Layout includes direct contact methods, social links, an optional support-studies CTA, and an availability status bar.

---

## Sections

| Section | Description |
|---|---|
| Header | Eyebrow + heading + subtitle from `bio.json` |
| Direct Contact | Method cards (email, phone, location) — links where applicable |
| Social Links | Brand-coloured social cards in a responsive grid |
| Support Studies | Conditional `MagneticButton` CTA — only rendered if `donation.enabled` is true |
| Availability | Coloured status bar driven by `availability.status` (`open` / `busy` / `closed`) |

---

## Background

Three glass triangle blobs driven by a JS physics engine:
- Continuous drift with velocity damping (`DAMPING: 0.999`)
- Soft pair repulsion prevents overlapping
- Periodic random nudges (every 2.5–6 s) prevent repeating patterns
- Rotation speed per blob (`rotSpeed` in `BLOB_DEFS`)
- Cursor position forwarded as `--cursor-x` / `--cursor-y` CSS vars for glow effects

---

## Data Source

All content from `src/data/bio.json` (`contactPage` and `socialLinks` keys).

---

## Reveal Behaviour

Three sections use a local `useReveal` hook (same pattern as Bio page): social grid, donation card, and status bar fade in as they scroll into view.

---

## Usage

```jsx
import Connect from './pages/Connect';

<Connect />
```


## Customization
To update contact information:
1. Edit `/src/data/contact.json`
2. Add/remove contact methods or social links
3. Update availability status and message
4. Colors adapt automatically to theme

## Design Philosophy
- **Clean**: No clutter, easy to scan
- **Professional**: Corporate-friendly design
- **Accessible**: Multiple contact options
- **Subtle**: Animations enhance, don't distract
