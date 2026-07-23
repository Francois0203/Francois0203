// Editable narrative/heading copy for the Home page. `default` values are the
// exact strings the page shipped with, so it renders identically until edited.
export const HOME_FIELDS = [
  // ── Cover ──
  { key: 'coverEyebrow',     label: 'Cover eyebrow',        type: 'text',     default: 'Prologue' },
  { key: 'coverTitleSerif',  label: 'Cover title (serif)',  type: 'text',     default: 'the portfolio of' },
  { key: 'coverByLabel',     label: 'Cover byline label',   type: 'text',     default: 'a collection of chapters' },
  { key: 'coverProseInvite', label: 'Cover opening invite', type: 'textarea', default: 'Pull up a chair, pour something warm.' },
  { key: 'coverInviteText',  label: 'Cover invitation',     type: 'textarea', default: 'Three chapters wait below. Turn the page whenever you’re ready.' },
  { key: 'coverCtaPrimary',  label: 'Cover primary button', type: 'text',     default: 'Begin reading' },
  { key: 'coverCtaSecondary',label: 'Cover second button',  type: 'text',     default: 'Browse the workshop' },

  // ── Scene: Choose your chapter ──
  { key: 'chaptersEye',   label: 'Chapters - eyebrow', type: 'text',     default: 'Chapter I' },
  { key: 'chaptersTitle', label: 'Chapters - title',   type: 'text',     default: 'Choose your chapter' },
  { key: 'chaptersLede',  label: 'Chapters - lede',    type: 'textarea', default: 'Three covers, three short stories. Tap one to peek inside; open it to read in full.' },

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
  { key: 'endText',     label: 'Epilogue text',          type: 'textarea', default: 'That is the prologue. The full story lives in three chapters, and they would love a reader. Pick one, or send word and we’ll write the next page together.' },

  // ── Chapter I card (Bio) ──
  { key: 'ch1Title',    label: 'Chapter I - title',    type: 'text',     default: 'The Storyteller' },
  { key: 'ch1Subtitle', label: 'Chapter I - subtitle', type: 'text',     default: 'A life in chapters' },
  { key: 'ch1Opening',  label: 'Chapter I - opening',  type: 'textarea', default: 'Every portfolio has a person behind it. This one is no exception.' },
  { key: 'ch1Excerpt',  label: 'Chapter I - excerpt',  type: 'textarea', default: 'Education, the roles that taught me the most, the languages and tools I picked up along the way - all laid out as a timeline you can walk through.' },
  { key: 'ch1Cta',      label: 'Chapter I - button',   type: 'text',     default: 'Open the Bio' },

  // ── Chapter II card (Projects) ──
  { key: 'ch2Title',    label: 'Chapter II - title',    type: 'text',     default: 'The Workshop' },
  { key: 'ch2Subtitle', label: 'Chapter II - subtitle', type: 'text',     default: 'Things I have built' },
  { key: 'ch2Opening',  label: 'Chapter II - opening',  type: 'textarea', default: 'Behind every craftsman is a workshop. Mine lives on GitHub.' },
  { key: 'ch2Excerpt',  label: 'Chapter II - excerpt',  type: 'textarea', default: 'A live look at the repositories I am most proud of - pulled fresh from GitHub, with READMEs you can read without ever leaving the page.' },
  { key: 'ch2Cta',      label: 'Chapter II - button',   type: 'text',     default: 'Step into the workshop' },

  // ── Chapter III card (Connect) ──
  { key: 'ch3Title',    label: 'Chapter III - title',    type: 'text',     default: 'A Letter' },
  { key: 'ch3Subtitle', label: 'Chapter III - subtitle', type: 'text',     default: 'Write to me' },
  { key: 'ch3Opening',  label: 'Chapter III - opening',  type: 'textarea', default: 'Stories are better when shared. So please - write to me.' },
  { key: 'ch3Excerpt',  label: 'Chapter III - excerpt',  type: 'textarea', default: 'A short note, a long story, a job, an idea. Drop a message and it lands directly in my inbox. Or find me on the usual networks.' },
  { key: 'ch3Cta',      label: 'Chapter III - button',   type: 'text',     default: 'Pen a letter' },
];
