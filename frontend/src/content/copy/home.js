// Editable copy for the Home page.

export const HOME_FIELDS = [
  // ── Scene 1: the title card ──
  { key: 'heroLede',      label: 'Hero - line above the name', type: 'text',     default: 'DevOps and Software Engineering' },
  { key: 'heroStatement', label: 'Hero - positioning line',    type: 'textarea', default: 'I put systems into production, and I keep them there.' },
  { key: 'heroCtaPrimary',   label: 'Hero - primary button',   type: 'text',     default: 'See the work' },
  { key: 'heroCtaSecondary', label: 'Hero - second button',    type: 'text',     default: 'Get in touch' },

  // ── The "right now" tile ──
  { key: 'nowTitle', label: 'Right now - label', type: 'text', default: 'Right now' },
  { key: 'offTitle', label: 'Outside work - label', type: 'text', default: 'Outside work' },

  /* The availability chip's wording, editable rather than hardcoded, because
     what he is available for changes far more often than the page does. The
     chip still only appears when the contact document's availability.status is
     'open', so it can be hidden from /admin without editing copy. */
  { key: 'availabilityLabel', label: 'Availability chip', type: 'text', default: 'Open to part-time' },

  // ── Scene 2: the statement, pinned ──
  { key: 'statementTitle', label: 'Statement - title',   type: 'text',     default: 'What I actually do' },
  { key: 'statementBody',  label: 'Statement - body',    type: 'textarea', default: 'Containers, pipelines and the infrastructure underneath them. I led several university projects end to end, then helped build three enterprise systems at Aquatico and put them into production on Docker and Kubernetes. An MSc on astronomical data processing runs alongside the job.' },

  // ── Scene 3: selected work ──
  { key: 'workTitle', label: 'Work - title', type: 'text',     default: 'Selected work' },
  { key: 'workLede',  label: 'Work - lede',  type: 'textarea', default: 'Running sites, not screenshots. Click into any of them.' },
  { key: 'workCta',   label: 'Work - button', type: 'text',    default: 'Every project' },
  { key: 'workEmpty', label: 'Work - empty state', type: 'textarea', default: 'The next one is still being built.' },

  // ── Scene 4: capabilities ──
  { key: 'toolkitTitle', label: 'Capabilities - title', type: 'text',     default: 'Capabilities' },

  // ── Scene 5: the journey ──
  { key: 'journeyTitle', label: 'Journey - title', type: 'text',     default: 'The journey so far' },
  { key: 'journeyLede',  label: 'Journey - lede',  type: 'textarea', default: 'Every waypoint in order. Open one to read it.' },
  { key: 'journeyEmpty', label: 'Journey - empty state', type: 'text', default: 'The route is still being drawn.' },

  /* The closing panel's title, text and button used to live here. The site now
     has one footer on every page (components/SiteFooter) and its wording is
     edited under the "Footer" group, so keeping these would offer three fields
     that change nothing. `toolkitLede` went with the scene rebuild: the
     capabilities tile carries a label, not a label and a paragraph. */
];
