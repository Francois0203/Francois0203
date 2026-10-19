// Editable copy for the Bio page, which reads as a CV.

export const BIO_FIELDS = [
  { key: 'eyebrow', label: 'Line above the name', type: 'text', default: 'curriculum vitae' },
  { key: 'lede',    label: 'Profile paragraph (fallback when the personal summary is empty)', type: 'textarea', default: 'I put systems into production and keep them there: containers, pipelines and the cloud underneath them.' },
  { key: 'printLabel', label: 'CV button', type: 'text', default: 'Download CV' },
  { key: 'cvPreparing', label: 'CV button - while the PDF is being made', type: 'text', default: 'Preparing…' },
  { key: 'cvFailed', label: 'CV - message when the PDF could not be made', type: 'text', default: 'The CV could not be made. Refresh and try again.' },

  { key: 'profileHeading', label: 'Profile heading', type: 'text', default: 'Profile' },
  { key: 'experienceHeading', label: 'Experience heading', type: 'text', default: 'Experience' },
  { key: 'educationHeading', label: 'Education heading', type: 'text', default: 'Education' },
  { key: 'certificationsHeading', label: 'Certifications heading', type: 'text', default: 'Certifications' },
  { key: 'skillsHeading', label: 'Skills heading', type: 'text', default: 'Skills' },
  { key: 'interestsHeading', label: 'Interests heading', type: 'text', default: 'Outside the work' },
  { key: 'languagesLabel', label: 'Languages label', type: 'text', default: 'languages' },

  { key: 'cvInterestsHeading', label: 'Printed CV - interests heading', type: 'text', default: 'Interests' },
  { key: 'cvLanguagesHeading', label: 'Printed CV - languages heading', type: 'text', default: 'Languages' },
  { key: 'cvProfilesHeading', label: 'Printed CV - online profiles heading', type: 'text', default: 'Profiles' },
  { key: 'cvInProgress', label: 'Printed CV - label for a certification in progress', type: 'text', default: 'in progress' },
  { key: 'cvPage', label: 'Printed CV - footer word for page (page 2 onwards)', type: 'text', default: 'Page' },
  { key: 'cvOf', label: 'Printed CV - footer word between page numbers', type: 'text', default: 'of' },
  { key: 'cvUpdated', label: 'Printed CV - words before the print date', type: 'text', default: 'Updated' },
  { key: 'cvIncomplete', label: 'Printed CV - message when some data did not load', type: 'text', default: 'Part of the CV did not load, so it was not printed. Refresh and try again.' },
];
