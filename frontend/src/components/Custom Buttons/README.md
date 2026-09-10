# Custom Buttons

Four buttons that exist because the global `button` system in
`styles/Components.css` deliberately does not do effects. Everything ordinary - 
admin forms, toolbars, table rows - uses the global variants (`btn-primary`,
`btn-secondary`, `btn-outline`, `btn-ghost`, `btn-danger`, `btn-success`, plus
`btn-sm` / `btn-lg` / `btn-icon` / `btn-block`). These four are for the handful
of places on the public site where a button is also a piece of the composition.

All four share the same contract:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Label and/or icons |
| `onClick` | `function` | - | Click handler |
| `disabled` | `boolean` | `false` | Disables interaction, stops the effect, dims the button |
| `type` | `string` | `'button'` | Native `type` attribute |
| `className` | `string` | `''` | Merged onto the root `<button>` |

Anything else is spread onto the `<button>`, so `aria-label`, `title` and
`data-*` pass through.

---

## Picking one

| | Weight | Effect | Use for |
|---|---|---|---|
| `ShimmerButton` | Primary | A band of light passes across the fill on hover | The one action a view is asking for |
| `GlowBorderButton` | Primary or glass | A light travelling the border | A single hero moment per page |
| `LightWaveButton` | Secondary | Gradient sweeps left→right | Standalone actions on a quiet surface |
| `CursorGlowButton` | Secondary | Spotlight follows the cursor | Sitting beside a primary |

Two rules that matter more than the individual components:

- **One primary per view.** Three loud buttons in a row is three buttons the
  reader has to choose between, which is the same as none.
- **`GlowBorderButton` is used once.** It is currently on the closing CTA of the
  Home page. Constant motion stops reading as special the second time you see
  it on the same scroll.

---

## Shared behaviour

Everything below is handled once, in `motion.js` and in the modules, rather than
per component:

- **Press.** Every button takes `scale(0.97)` on `:active` over 120ms. `scale`
  rather than `translateY` so the label and icons compress with the surface, and
  so a press can never nudge a neighbour into a relayout.
- **Hover is gated** behind `@media (hover: hover) and (pointer: fine)`. Without
  it a tap on a phone triggers hover and it sticks until something else is
  tapped.
- **Pointer effects are gated** on `motionAllowed()`, checked at interaction
  time, not at mount. It returns false for touch pointers, for
  `prefers-reduced-motion`, and for the site's own Reduce Animations switch - 
  which the previous versions ignored entirely, because the switch works by
  killing CSS transitions and these effects were driven from JS.
- **Reduced motion keeps the button and drops the travel.** Each module has a
  `prefers-reduced-motion` block that leaves a legible hover state behind rather
  than removing the feedback altogether.

---

## ShimmerButton

Solid accent fill. On hover a narrow band of light passes across it once, the
fill brightens, and a trailing icon leans 2px toward wherever it points.

```jsx
<ShimmerButton onClick={() => navigate('/bio')}>
  Read the bio <MdAutoStories aria-hidden="true" />
</ShimmerButton>
```

**Notes**

- Replaced `MagneticButton`, which followed the cursor. Cursor-following is the
  wrong instinct for a primary action: the button most likely to be clicked was
  the one moving away from the pointer aiming at it, and the label drifting
  inside the surface made the control read as unstable.
- No JavaScript at all - no pointer handlers, no RAF loop, no re-renders.
- The band is a one-shot **animation**, not a hover transition. A transition
  would have to run backwards on leave, so the light would reverse out the way
  it came. An animation ends parked off the right edge and resets off the left
  edge - both invisible - so the unhover has nothing to undo. Losing
  interruptibility does not cost anything here, because a re-hover mid-sweep
  just restarts a pass whose endpoints are already off-screen.
- The band is skewed 18°. A hard vertical edge reads as a UI element sliding
  past; an angled one reads as a reflection.
- The trailing-icon nudge is guarded with `:not(:first-child)` so an icon-only
  button does not drift sideways.

## GlowBorderButton

A single point of light travelling continuously around the border. Takes an
extra `tone` prop: `'glass'` (default) or `'solid'`.

```jsx
<GlowBorderButton tone="solid" onClick={() => navigate('/connect')}>
  <MdEmail aria-hidden="true" /> Write a letter
</GlowBorderButton>
```

**Notes**

- No JavaScript, and no animated `@property --angle`. Animating an angle inside
  a `conic-gradient` rebuilds the gradient on the main thread every frame. This
  spins an oversized square carrying a *static* conic gradient, clipped to a 1px
  masked ring - one composited `transform`, off the main thread.
- The spinner is 150% of the button's width so its corners clear the ring on a
  wide button; below that the light stutters at the ends.
- `linear` timing. Any easing on a loop makes the light hesitate at the same
  point every lap.
- Hover brightens the light, it does not speed it up: changing
  `animation-duration` mid-lap restarts the clock and the light jumps.
- `.rim` is a separate constant hairline underneath. Without it the button loses
  its outline wherever the light is not, which reads as a rendering fault.

## LightWaveButton

A gradient that sweeps in from the left on hover and continues out through the
right on leave. Pure CSS.

```jsx
<LightWaveButton onClick={() => onReadme(project)}>
  Read me
</LightWaveButton>
```

**Notes**

- The direction is the point. The previous version slid the fill in from the
  left and back out to the left, so the light appeared to change its mind.
- Mechanism: `scaleX(0)` with `transform-origin: right` at rest, `scaleX(1)`
  with `transform-origin: left` on hover. `transform-origin` is not in the
  transition list, so it snaps while `scaleX` interpolates - which is what turns
  two opposite scale animations into one continuous left-to-right pass.
- The label colour flips on a 170ms delay entering and no delay leaving, so it
  changes once the fill is most of the way across rather than while half the
  label still sits on the transparent surface.

## CursorGlowButton

Frosted glass lit by a spotlight that tracks the cursor across the surface and
around the border.

```jsx
<CursorGlowButton onClick={() => navigate('/projects')}>
  See the work
</CursorGlowButton>
```

**Notes**

- Two radial gradients, not five: one tight spotlight, one wide falloff. The
  previous version recomputed four gradients per frame for a difference that is
  not visible.
- The border ring uses the CSS mask punch-out technique - fill the box, fill the
  content-box, composite the second out of the first, and only the 1px padding
  gap survives.
- Both positions are seeded at the entry point on `pointerenter`. Without that
  the glow lerps in from wherever the last hover left it, so every hover began
  with a light streaking across the button.
- Glow opacity is a CSS `:hover` concern. It used to be React state driving an
  inline style, which re-rendered the button and its children on every enter and
  leave.
