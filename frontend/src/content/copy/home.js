export const HOME_FIELDS = [
  // Hero
  { key: 'heroIntro', label: 'Hero - introduction', type: 'textarea', default: 'I am a DevOps engineer in Centurion. In plain words, I keep websites and apps running smoothly behind the scenes, and I build websites for small businesses.' },
  { key: 'heroCtaPrimary',   label: 'Hero - primary button', type: 'text', default: 'See my work' },
  { key: 'heroCtaSecondary', label: 'Hero - second button',  type: 'text', default: 'Get in touch' },

  // Only shown while the contact document's availability.status is 'open'.
  { key: 'availabilityLabel', label: 'Availability chip', type: 'text', default: 'open to part-time work' },

  // Toy box around the photo. Interests come from the database; these words join them.
  { key: 'toyWords',     label: 'Toy box - extra words (comma separated)', type: 'text', default: 'Websites, The cloud, Automation' },
  { key: 'toyHint',      label: 'Toy box - hint (mouse)', type: 'text', default: 'Go on, grab one and throw it' },
  { key: 'toyHintTouch', label: 'Toy box - hint (touch)', type: 'text', default: 'Tap to shake things up' },


  // The story
  { key: 'storyTitle', label: 'Story - headline (italic in *asterisks*)', type: 'text', default: 'The story *so far*.' },
  { key: 'storyLede',  label: 'Story - lede', type: 'textarea', default: 'Every stop is a real role or qualification, oldest first. Keep scrolling.' },
  { key: 'storyKindWork', label: 'Story - label on a job', type: 'text', default: 'work' },
  { key: 'storyKindStudy', label: 'Story - label on a qualification', type: 'text', default: 'study' },
  { key: 'storyNextKind', label: 'Story - label on the last chapter', type: 'text', default: 'next' },
  { key: 'storyNextNote', label: 'Story - text on the last chapter', type: 'textarea', default: 'Working through the AWS certifications, from Cloud Practitioner to DevOps Engineer Professional, alongside an MSc in Computer Science.' },

  { key: 'curtainLabel', label: 'Work - headline (marker on *word*)', type: 'text', default: 'Selected *work*.' },

  // Work
  { key: 'workLede',  label: 'Work - lede',  type: 'textarea', default: 'Websites I built for small businesses. Click one to visit it.' },
  { key: 'workCta',   label: 'Work - button', type: 'text', default: 'All projects' },
  { key: 'workEmpty', label: 'Work - empty state', type: 'textarea', default: 'The next one is still being built.' },
  { key: 'storyFrom', label: 'Story - word above the start date', type: 'text', default: 'from' },
  { key: 'storyYear', label: 'Story - one year, short', type: 'text', default: 'yr' },
  { key: 'storyYears', label: 'Story - several years, short', type: 'text', default: 'yrs' },
  { key: 'storyMonth', label: 'Story - one month, short', type: 'text', default: 'mo' },
  { key: 'storyMonths', label: 'Story - several months, short', type: 'text', default: 'mos' },
  { key: 'storyNowShort', label: 'Story - dial word for now', type: 'text', default: 'now' },
  { key: 'storyNextShort', label: 'Story - dial word for next', type: 'text', default: 'next' },
  { key: 'storyNowLong', label: 'Story - card word for now', type: 'text', default: 'Now' },
  { key: 'storyPresent', label: 'Story - card word for a current end date', type: 'text', default: 'Present' },
  { key: 'storyNextLong', label: 'Story - card word for next', type: 'text', default: 'Next' },
  { key: 'storyMonthNames', label: 'Story - month names, comma separated', type: 'text', default: 'Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec' },
  { key: 'storyTo', label: 'Story - word between two years (read aloud)', type: 'text', default: 'to' },
  { key: 'storyPhoto', label: 'Story - name of a photo with no caption (read aloud)', type: 'text', default: 'photo' },
];
