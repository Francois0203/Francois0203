// Editable copy for the Projects page.
//
// Rewritten to match the Home page's structure. This page used to be framed as
// "Chapter II - The Workshop", ending with "Turn the page" and "Chapter III - A
// Letter". Home dropped that book conceit, so keeping it here left the two
// pages telling different stories in different voices.
//
// The eyebrow now states what the page is, the heading states a position, and
// the figures under it are counted from the live GitHub and studio data rather
// than written by hand. Old keys are not preserved: a Firestore override saved
// against `chapterMark` has no meaning on a page with no chapters.
export const PROJECTS_FIELDS = [
  // ── Scene 1: the title card ──
  { key: 'eyebrow',  label: 'Hero - line above the heading', type: 'text',     default: 'Selected work' },
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
