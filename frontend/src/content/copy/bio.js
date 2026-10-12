// Editable copy for the Bio page, which reads as a CV.

export const BIO_FIELDS = [
  { key: 'eyebrow', label: 'Line above the name', type: 'text', default: 'curriculum vitae' },
  { key: 'lede',    label: 'Profile paragraph (fallback when the personal summary is empty)', type: 'textarea', default: 'I put systems into production and keep them there: containers, pipelines and the cloud underneath them.' },
  { key: 'printLabel', label: 'Print button', type: 'text', default: 'Print CV' },

  { key: 'profileHeading', label: 'Profile heading', type: 'text', default: 'Profile' },
  { key: 'experienceHeading', label: 'Experience heading', type: 'text', default: 'Experience' },
  { key: 'educationHeading', label: 'Education heading', type: 'text', default: 'Education' },
  { key: 'certificationsHeading', label: 'Certifications heading', type: 'text', default: 'Certifications' },
  { key: 'otherCertificationsHeading', label: 'Certifications without an exam code - heading', type: 'text', default: 'Also certified' },
  { key: 'skillsHeading', label: 'Skills heading', type: 'text', default: 'Skills' },
  { key: 'interestsHeading', label: 'Interests heading', type: 'text', default: 'Outside the work' },
  { key: 'languagesLabel', label: 'Languages label', type: 'text', default: 'languages' },
];
