// Editable copy for the certification badges, shown on Home and Bio.

export const CREDENTIALS_FIELDS = [
  { key: 'title', label: 'Home - title', type: 'text', default: 'Certification path' },
  { key: 'lede',  label: 'Home - lede',  type: 'textarea', default: 'AWS, from Cloud Practitioner through to DevOps Engineer Professional. Earned badges link to their verification; the rest are marked for what they are.' },

  { key: 'statusEarned',   label: 'Status - earned',   type: 'text', default: 'Earned' },
  { key: 'statusBooked',   label: 'Status - exam booked', type: 'text', default: 'Exam booked' },
  { key: 'statusStudying', label: 'Status - studying', type: 'text', default: 'Studying' },
  { key: 'statusPlanned',  label: 'Status - planned',  type: 'text', default: 'Planned' },

  { key: 'expiresLabel', label: 'Before the expiry date', type: 'text', default: 'valid to' },
  { key: 'verifyLabel',  label: 'Verify link', type: 'text', default: 'Verify badge' },
];
