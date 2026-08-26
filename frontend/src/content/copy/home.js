// Editable narrative/heading copy for the Home page. `default` values are the
// exact strings the page shipped with, so it renders identically until edited.
export const HOME_FIELDS = [
  // ── Cover ──
  { key: 'coverEyebrow',     label: 'Cover eyebrow',        type: 'text',     default: 'Prologue' },
  { key: 'coverTitleSerif',  label: 'Cover title (serif)',  type: 'text',     default: 'the portfolio of' },
  { key: 'coverByLabel',     label: 'Cover byline label',   type: 'text',     default: 'a collection of chapters' },
  { key: 'coverProseInvite', label: 'Cover opening invite', type: 'textarea', default: 'Pull up a chair, pour something warm.' },
  { key: 'coverInviteText',  label: 'Cover invitation',     type: 'textarea', default: 'The story picks up below. Turn the page whenever you’re ready.' },
  { key: 'coverCtaPrimary',  label: 'Cover primary button', type: 'text',     default: 'Begin reading' },
  { key: 'coverCtaSecondary',label: 'Cover second button',  type: 'text',     default: 'Browse the workshop' },

  // ── Scene: Featured work ──
  { key: 'workEye',      label: 'Featured work - eyebrow',  type: 'text',     default: 'Chapter I' },
  { key: 'workTitle',    label: 'Featured work - title',    type: 'text',     default: 'Sites I have built' },
  { key: 'workLede',     label: 'Featured work - lede',     type: 'textarea', default: 'Real, running websites - not screenshots. Have a click around, then take the tour of the rest.' },
  { key: 'workCta',      label: 'Featured work - button',   type: 'text',     default: 'See every site' },
  { key: 'workEmpty',    label: 'Featured work - empty',    type: 'textarea', default: 'The next site is still on the workbench. Check back shortly.' },

  // ── Scene: The journey so far ──
  { key: 'journeyEye',   label: 'Journey - eyebrow', type: 'text',     default: 'Chapter II' },
  { key: 'journeyTitle', label: 'Journey - title',   type: 'text',     default: 'The journey so far' },
  { key: 'journeyLede',  label: 'Journey - lede',    type: 'textarea', default: 'A meandering path of schools, jobs, and small obsessions. Press a milestone to read its page.' },

  // ── Scene: The toolkit ──
  { key: 'toolkitEye',   label: 'Toolkit - eyebrow', type: 'text',     default: 'Chapter III' },
  { key: 'toolkitTitle', label: 'Toolkit - title',   type: 'text',     default: 'The toolkit' },
  { key: 'toolkitLede',  label: 'Toolkit - lede',    type: 'textarea', default: 'The tools I gather along the way - pinned here like pressed leaves.' },

  // ── Epilogue ──
  { key: 'endTitlePre', label: 'Epilogue title (lead)',  type: 'text',     default: 'The End… ' },
  { key: 'endTitleEm',  label: 'Epilogue title (accent)',type: 'text',     default: 'or just the beginning?' },
  { key: 'endText',     label: 'Epilogue text',          type: 'textarea', default: 'That is the prologue. The rest of the story is a click away, and it would love a reader. Pick a page below, or send word and we’ll write the next one together.' },

];
