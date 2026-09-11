// Editable copy for the site footer.
//
// The footer is the one place that states what he is available for, so that
// wording lives here rather than being written into three page endings that
// then disagree with each other. It changes more often than the site does.
export const FOOTER_FIELDS = [
  { key: 'nextLabel', label: 'Next page - label', type: 'text', default: 'Next' },

  { key: 'ctaTitle', label: 'Call to action - title', type: 'text',     default: 'Something to build?' },
  { key: 'ctaText',  label: 'Call to action - text',  type: 'textarea', default: 'In a full-time role, and open to part-time work with the hours by arrangement.' },
  { key: 'ctaButton', label: 'Call to action - button', type: 'text',   default: 'Write a letter' },

  { key: 'navHeading',    label: 'Column heading - pages',   type: 'text', default: 'Pages' },
  { key: 'reachHeading',  label: 'Column heading - contact', type: 'text', default: 'Reach me' },
  { key: 'socialHeading', label: 'Column heading - social',  type: 'text', default: 'Elsewhere' },

  { key: 'topLabel', label: 'Back to top - label', type: 'text', default: 'Back to top' },
];
