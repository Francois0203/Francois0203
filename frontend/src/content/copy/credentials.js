// Editable copy for the certification path, shown on Home and Bio.

export const CREDENTIALS_FIELDS = [
  { key: 'title', label: 'Home - headline (italic in *asterisks*)', type: 'text', default: 'The AWS *path*.' },
  { key: 'lede',  label: 'Home - lede', type: 'textarea', default: 'From Cloud Practitioner through to DevOps Engineer Professional. Earned badges link to their verification; the rest are marked for what they are.' },

  { key: 'statusEarned',   label: 'Status - earned',   type: 'text', default: 'earned' },
  { key: 'statusBooked',   label: 'Status - exam booked', type: 'text', default: 'exam booked' },
  { key: 'statusStudying', label: 'Status - studying', type: 'text', default: 'studying' },
  { key: 'statusPlanned',  label: 'Status - planned',  type: 'text', default: 'planned' },

  { key: 'expiresLabel', label: 'Before the expiry date', type: 'text', default: 'valid to' },
  { key: 'verifyLabel',  label: 'Verify link', type: 'text', default: 'Verify badge' },
];
