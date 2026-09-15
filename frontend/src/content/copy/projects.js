// Editable copy for the Projects page.

export const PROJECTS_FIELDS = [
  // ── Scene 1: the title card ──
  { key: 'eyebrow',  label: 'Hero - line above the heading', type: 'text',     default: 'Work' },
  { key: 'heading',  label: 'Hero - heading',                type: 'text',     default: 'Things I have built' },
  { key: 'lede',     label: 'Hero - positioning line',       type: 'textarea', default: 'Client sites running in production, and the repositories where the techniques get worked out.' },

  // ── Scene 2: the live sites ──
  { key: 'studioTitle', label: 'Client work - title', type: 'text',     default: 'Live in production' },
  { key: 'studioLede',  label: 'Client work - lede',  type: 'textarea', default: 'Running sites, not screenshots. Click into any one of them and use it as a visitor would.' },
  { key: 'studioEmpty', label: 'Client work - empty state', type: 'textarea', default: 'No client sites are published yet.' },

  // ── Scene 3: the repositories ──
  { key: 'codeTitle', label: 'Code section - title', type: 'text',     default: 'The bench' },
  { key: 'codeLede',  label: 'Code section - lede',  type: 'textarea', default: 'Repositories, tools and half-finished ideas. Filter by language.' },
  { key: 'codeEmpty', label: 'Code section - empty state', type: 'text', default: 'No projects configured yet.' },

  /* The closing panel's fields were removed with the panel itself: the shared
     site footer now ends every page, and its copy lives under "Footer". */
];
