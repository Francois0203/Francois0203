// Editable copy for the Bio page.

export const BIO_FIELDS = [
  { key: 'eyebrow', label: 'Line above the name', type: 'text', default: 'curriculum vitae' },
  { key: 'lede',    label: 'Profile paragraph (fallback when the personal summary is empty)', type: 'textarea', default: 'I put systems into production and keep them there: containers, pipelines and the cloud underneath them.' },
  { key: 'printLabel', label: 'CV button', type: 'text', default: 'Download CV' },
  { key: 'cvReady', label: 'CV - message when the PDF has downloaded', type: 'text', default: 'Your CV is downloading.' },
  { key: 'cvFailed', label: 'CV - message when the PDF could not be made', type: 'text', default: 'The CV could not be made. Refresh and try again.' },

  { key: 'profileHeading', label: 'Profile heading', type: 'text', default: 'Profile' },
  { key: 'experienceHeading', label: 'Experience heading', type: 'text', default: 'Experience' },
  { key: 'educationHeading', label: 'Education heading', type: 'text', default: 'Education' },
  { key: 'certificationsHeading', label: 'Certifications heading', type: 'text', default: 'Certifications' },
  { key: 'skillsHeading', label: 'Skills heading', type: 'text', default: 'Skills' },
  { key: 'interestsHeading', label: 'Interests heading', type: 'text', default: 'Outside the work' },
  { key: 'contentsLabel', label: 'Side menu - title', type: 'text', default: 'On this page' },
  { key: 'nowLabel', label: 'Badge on a current role', type: 'text', default: 'now' },
  { key: 'earlierLabel', label: 'Date shown when a record has no dates', type: 'text', default: 'Earlier' },
  { key: 'basedLabel', label: 'Contact - location label', type: 'text', default: 'Based in' },
  { key: 'emailLabel', label: 'Contact - email label', type: 'text', default: 'Email' },
  { key: 'phoneLabel', label: 'Contact - phone label', type: 'text', default: 'Phone' },
  { key: 'skillsHint', label: 'Skills - hint (mouse)', type: 'text', default: 'Grab one and give it a shake.' },
  { key: 'skillsOther', label: 'Skills - name for skills without a group', type: 'text', default: 'Also' },
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
