// Editable copy for the Home page.
//
// Rewritten for the cinematic-scroll structure. The page used to be framed as a
// book: "Prologue", "the portfolio of", "a collection of chapters", "Chapter I"
// through "Chapter III", "The End... or just the beginning?", and an invitation
// to "pull up a chair, pour something warm". That framing was the page's story,
// and it was the thing that had to change - it read as twee rather than
// premium, and it put 120 words of prose in front of any evidence of the work.
//
// The scenes now state a position, prove it, and get out of the way. Serif and
// warm accent are kept; the conceit is not.
//
// Old keys are deliberately not preserved. Any Firestore override saved against
// a removed key is simply ignored, which is the correct outcome: an override of
// "Chapter II" has no meaning in a page that no longer has chapters.
export const HOME_FIELDS = [
  // ── Scene 1: the title card ──
  { key: 'heroLede',      label: 'Hero - line above the name', type: 'text',     default: 'Data Scientist and Software Developer' },
  { key: 'heroStatement', label: 'Hero - positioning line',    type: 'textarea', default: 'I build systems that turn data into decisions.' },
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
  { key: 'statementBody',  label: 'Statement - body',    type: 'textarea', default: 'Predictive modelling for cap tables at Shareforce, and an MSc on astronomical data processing at North-West University. Before that, three enterprise systems built from nothing in sixteen months. Statistics and engineering are the same job.' },

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
