// Editable copy for the footer. It says what he is available for, which
// changes more often than the site does, so it lives in one place.

export const FOOTER_FIELDS = [
  { key: 'nextLabel', label: 'Next page - label', type: 'text', default: 'Next' },

  { key: 'ctaTitle', label: 'Call to action - title', type: 'text',     default: 'Something to build?' },
  { key: 'ctaText',  label: 'Call to action - text',  type: 'textarea', default: 'In a full-time role, and open to part-time work with the hours by arrangement.' },
  { key: 'ctaButton', label: 'Call to action - button', type: 'text',   default: 'Get in touch' },

  { key: 'navHeading',    label: 'Column heading - pages',   type: 'text', default: 'Pages' },
  { key: 'reachHeading',  label: 'Column heading - contact', type: 'text', default: 'Reach me' },
  { key: 'socialHeading', label: 'Column heading - social',  type: 'text', default: 'Elsewhere' },

  { key: 'topLabel', label: 'Back to top - label', type: 'text', default: 'Back to top' },
];
