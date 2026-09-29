// Editable copy for the Home page.

export const HOME_FIELDS = [
  // ── Scene 1: the title card ──
  { key: 'heroLede',      label: 'Hero - line above the name', type: 'text',     default: 'DevOps, Cloud and Software Engineering' },
  { key: 'heroStatement', label: 'Hero - positioning line',    type: 'textarea', default: 'I put systems into production, and I keep them there.' },
  { key: 'heroCtaPrimary',   label: 'Hero - primary button',   type: 'text',     default: 'See the work' },
  { key: 'heroCtaSecondary', label: 'Hero - second button',    type: 'text',     default: 'Get in touch' },

  // ── The "right now" tile ──
  { key: 'nowTitle', label: 'Right now - label', type: 'text', default: 'Right now' },

  // Only shown while the contact document's availability.status is 'open'.
  { key: 'availabilityLabel', label: 'Availability chip', type: 'text', default: 'Open to part-time' },

  // ── Scene 2: the statement ──
  { key: 'statementBody',  label: 'Statement - body',    type: 'textarea', default: 'Containers, pipelines and the cloud underneath them. In my previous role I was one of two developers who replaced a company\'s operational software, then ran it in production on Docker and Kubernetes. At Shareforce I work on a Django platform deployed across Heroku and AWS, and on the pipelines it ships through. Now working through the AWS certifications, starting with Cloud Practitioner.' },

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
];
