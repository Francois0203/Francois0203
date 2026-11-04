// Words used across the whole site: the menu, the intro, the error and loading screens.
export const SITE_FIELDS = [
  { key: 'name', label: 'Your name (shown before the profile loads)', type: 'text', default: 'Francois Meiring' },
  { key: 'role', label: 'Intro - title under your name', type: 'text', default: 'DevOps and Software Engineer' },
  { key: 'introSkip', label: 'Intro - skip hint', type: 'text', default: 'Press any key to skip' },

  { key: 'navHome', label: 'Menu - Home', type: 'text', default: 'Home' },
  { key: 'navHomeBlurb', label: 'Menu - Home description', type: 'text', default: 'The short version' },
  { key: 'navBio', label: 'Menu - Bio', type: 'text', default: 'Bio' },
  { key: 'navBioBlurb', label: 'Menu - Bio description', type: 'text', default: 'The longer story, and the record' },
  { key: 'navProjects', label: 'Menu - Projects', type: 'text', default: 'Projects' },
  { key: 'navProjectsBlurb', label: 'Menu - Projects description', type: 'text', default: 'Live sites and the repositories' },
  { key: 'navConnect', label: 'Menu - Connect', type: 'text', default: 'Connect' },
  { key: 'navConnectBlurb', label: 'Menu - Connect description', type: 'text', default: 'Send a letter, or find me elsewhere' },

  { key: 'privacyLink', label: 'Footer - privacy link', type: 'text', default: 'Privacy' },
  { key: 'termsLink', label: 'Footer - terms link', type: 'text', default: 'Terms' },
  { key: 'dragHint', label: 'Hint on things you can drag', type: 'text', default: 'Drag me' },

  { key: 'loading', label: 'Loading screen - text for screen readers', type: 'text', default: 'Loading the page' },

  { key: 'errorTitle', label: 'Error screen - title', type: 'text', default: 'That did not go to plan' },
  { key: 'errorText', label: 'Error screen - text', type: 'textarea', default: 'Something on this page broke while it was loading. Try again first. If it keeps happening, reload or head back to the start.' },
  { key: 'errorRetry', label: 'Error screen - try again button', type: 'text', default: 'Try again' },
  { key: 'errorReload', label: 'Error screen - reload button', type: 'text', default: 'Reload' },
  { key: 'errorHome', label: 'Error screen - home button', type: 'text', default: 'Back to the start' },
  { key: 'errorDetails', label: 'Error screen - details toggle', type: 'text', default: 'Technical details' },
];
