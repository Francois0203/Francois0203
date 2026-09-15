/*
 * The site's pages, in reading order. One list, because two hand-maintained
 * copies of "what pages exist" drift the moment a page is added.
 *
 * `blurb` is what the footer says when it points at a page. The order is also
 * the next-page order, wrapping, so there is no dead end anywhere.
 */
export const NAVIGATION_PAGES = [
  { label: 'Home',     to: '/',         blurb: 'The short version' },
  { label: 'Bio',      to: '/bio',      blurb: 'The longer story, and the record' },
  { label: 'Projects', to: '/projects', blurb: 'Live sites and the repositories' },
  { label: 'Connect',  to: '/connect',  blurb: 'Send a letter, or find me elsewhere' },
];

/** The page after `pathname`, wrapping. Null on /admin and the 404. */
export const nextPage = (pathname) => {
  const i = NAVIGATION_PAGES.findIndex(p => p.to === pathname);
  if (i === -1) return null;
  return NAVIGATION_PAGES[(i + 1) % NAVIGATION_PAGES.length];
};
