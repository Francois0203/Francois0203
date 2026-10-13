export const HOME_FIELDS = [
  // Hero
  { key: 'heroIntro', label: 'Hero - introduction', type: 'textarea', default: 'I am a DevOps engineer in Centurion. I look after the pipelines, containers and cloud that software runs on, and I build websites for small businesses.' },
  { key: 'heroCtaPrimary',   label: 'Hero - primary button', type: 'text', default: 'See my work' },
  { key: 'heroCtaSecondary', label: 'Hero - second button',  type: 'text', default: 'Get in touch' },

  // Only shown while the contact document's availability.status is 'open'.
  { key: 'availabilityLabel', label: 'Availability chip', type: 'text', default: 'open to part-time work' },

  { key: 'runsOnTitle', label: 'Tools strip - label', type: 'text', default: 'day to day' },

  // The story
  { key: 'storyTitle', label: 'Story - headline (italic in *asterisks*)', type: 'text', default: 'The story *so far*.' },
  { key: 'storyLede',  label: 'Story - lede', type: 'textarea', default: 'Every stop is a real role or qualification, oldest first. Keep scrolling.' },
  { key: 'storyNextKind', label: 'Story - label on the last chapter', type: 'text', default: 'next' },
  { key: 'storyNextNote', label: 'Story - text on the last chapter', type: 'textarea', default: 'Working through the AWS certifications, from Cloud Practitioner to DevOps Engineer Professional, alongside an MSc in Computer Science.' },

  { key: 'curtainLabel', label: 'Selected work - band title', type: 'text', default: 'Selected work' },

  // Work
  { key: 'workLede',  label: 'Work - lede',  type: 'textarea', default: 'Real sites I built for clients, running right now. Pick one from the list and use it.' },
  { key: 'workCta',   label: 'Work - button', type: 'text', default: 'All projects' },
  { key: 'workEmpty', label: 'Work - empty state', type: 'textarea', default: 'The next one is still being built.' },
];
