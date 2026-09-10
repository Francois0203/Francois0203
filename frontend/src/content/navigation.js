/**
 * The site's pages, in reading order.
 *
 * This list used to live inside App.js, where only the navigation bar could see
 * it. The footer needs exactly the same list, and two hand-maintained copies of
 * "what pages exist" is the kind of thing that drifts the moment a page is
 * added: the nav would show it and the footer would not.
 *
 * `blurb` is what the footer says about each page when it points at it. It is a
 * fixed description of the page's purpose rather than editable copy, because it
 * is a label for a route, not content.
 *
 * The order is also the "next page" order the footer walks, wrapping from the
 * last page back to the first, so there is no dead end anywhere on the site.
 */
export const NAVIGATION_PAGES = [
  { label: 'Home',     to: '/',         blurb: 'The short version' },
  { label: 'Bio',      to: '/bio',      blurb: 'The longer story, and the record' },
  { label: 'Projects', to: '/projects', blurb: 'Live sites and the repositories' },
  { label: 'Connect',  to: '/connect',  blurb: 'Send a letter, or find me elsewhere' },
];

/** The page after `pathname`, wrapping at the end. Null if the path is not a
 *  known page, which is the case on /admin and the 404. */
export const nextPage = (pathname) => {
  const i = NAVIGATION_PAGES.findIndex(p => p.to === pathname);
  if (i === -1) return null;
  return NAVIGATION_PAGES[(i + 1) % NAVIGATION_PAGES.length];
};
