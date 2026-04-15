# Bio Page

Fullscreen professional profile page with scroll-reveal sections and a liquid glass card layout.

---

## Sections

| Section | Content |
|---|---|
| Profile | Headshot, name, title, contact grid, metadata pills, social links, CTA |
| Experience | IntersectionObserver-animated timeline with stagger delays |
| Education | Stagger-animated grid cards |
| Skills & Technologies | Categorised tag rows + technical icon grid + projects CTA |

---

## Data Source

All content from `src/data/bio.json` — no hardcoded text in the component.

---

## Reveal Behaviour

- Profile section fades in on mount (80 ms delay)
- All other sections use a local `useReveal` hook — fires once when the element scrolls into view (`threshold: 0.08`), then disconnects the observer
- Stagger delays applied via `--item-delay` CSS custom property

---

## Icon Maps

| Map | Icons |
|---|---|
| `TECH_ICON_MAP` | `FaReact`, `FaPython`, `FaJs`, `FaNodeJs`, `FaDocker`, `FaGitAlt`, `FaHtml5`, `FaCss3Alt`, `FaLinux`, `FaDatabase`, `FaServer`, `SiPostgresql`, `SiKubernetes`, `SiNginx`, `SiR` |
| `SOCIAL_ICON_MAP` | `FaLinkedin`, `FaGithub`, `FaInstagram`, `FaOrcid`, `SiHackerrank`, `FaCode` |

Icon keys are stored in `bio.json`; the maps resolve them at render time.

---

## Usage

```jsx
import Bio from './pages/Bio';

<Bio />
```


## Customization
To update bio information:
1. Edit `/src/data/bio.json`
2. Update profile image at `/src/Images/Profile.jpeg`
3. Colors automatically adapt to theme

## Design Philosophy
- **Professional**: Clean, corporate-friendly design
- **Scannable**: Easy to quickly find information
- **Interactive**: Subtle animations provide feedback
- **Responsive**: Works perfectly on all devices
