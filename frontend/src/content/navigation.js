export const NAVIGATION_PAGES = [
  { label: 'Home',     to: '/',         blurb: 'The short version', tone: 'yellow' },
  { label: 'Bio',      to: '/bio',      blurb: 'The longer story, and the record', tone: 'blue' },
  { label: 'Projects', to: '/projects', blurb: 'Live sites and the repositories', tone: 'green' },
  { label: 'Connect',  to: '/connect',  blurb: 'Send a letter, or find me elsewhere', tone: 'orange' },
];

// A colour that dark text stays readable on. Indigo is too dark, so it uses its softer shade.
export const fillOf = (tone = 'yellow') => (tone === 'blue' ? 'var(--c-blue-soft)' : `var(--c-${tone})`);

// The colours for a page's tab.
export const tabStyle = (tone = 'yellow') => ({
  '--tab': fillOf(tone),
  '--tab-deep': `var(--c-${tone}-deep)`,
  '--tab-on': '#1f1f1f',
});

// The next page, looping back to the first.
export const nextPage = (pathname) => {
  const i = NAVIGATION_PAGES.findIndex(p => p.to === pathname);
  if (i === -1) return null;
  return NAVIGATION_PAGES[(i + 1) % NAVIGATION_PAGES.length];
};
