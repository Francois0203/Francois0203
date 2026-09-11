import { UNSAFE_LocationContext as LocationContext } from 'react-router-dom';
import ContentContext from '../context/ContentContext';
import SiteFooter from '../components/SiteFooter';

/**
 * A development-only harness for the site footer.
 *
 * The footer is the hardest thing on this site to look at. It sits below a
 * `min-height: 100svh` page, so on a live route it begins at exactly one
 * viewport down and a headless screenshot - which captures the window, not the
 * document - can never contain it. And it is built almost entirely from the
 * Firestore documents (the contact details, the social links, the real name),
 * which do not reliably resolve under `--virtual-time-budget`, so even scrolled
 * into view it would often screenshot as three empty columns.
 *
 * So: the real component, with its context supplied directly and nothing above
 * it. It paints on the first frame, with representative data, at any width.
 * Same arrangement as dev/RoadmapPreview, for the same reason.
 *
 * Reached at /__preview/footer, and only in dev - App.js gates the route on
 * import.meta.env.DEV, so neither this file nor the fixtures below reach the
 * production bundle.
 */

/* Shaped like the live documents, and deliberately at their awkward extremes:
   a long email, a location with three parts (the footer keeps the last two),
   and the full social list, which is the column that decides how tall the
   footer is. */
const VALUE = {
  data: {
    personal: { name: 'François Meiring' },
    contact: {
      email: 'francois.meiring.dev@example.com',
      phone: '+27 82 000 0000',
      location: 'Irene, Centurion, South Africa',
    },
    social: [
      { key: 'github',   platform: 'GitHub',   url: 'https://github.com/' },
      { key: 'linkedin', platform: 'LinkedIn', url: 'https://linkedin.com/' },
      { key: 'email',    platform: 'Email',    url: 'mailto:x@example.com' },
      { key: 'x',        platform: 'X',        url: 'https://x.com/' },
    ],
  },
  loading: false,
  error: null,

  /* Empty overrides resolve to the in-code defaults in content/copy/footer.js,
     which is what the site ships with and therefore what should be reviewed. */
  overrides: {},
  copyLoading: false,
  copy: () => ({}),

  projects: [], projectsLoading: false, projectsError: null,
  studioSites: [], studioLoading: false, studioError: null,
  reload: () => {},
};

/**
 * One footer, pinned to a chosen path.
 *
 * The footer reads the route to decide which page to point at next, so its
 * lead row has two shapes - two-up on a real page, and the call to action
 * alone on the 404 - and this preview is not one of the four pages, so plainly
 * rendered it would only ever show the second. The obvious fix does not work:
 * react-router refuses a nested router outright ("You cannot render a <Router>
 * inside another <Router>").
 *
 * So the location context is overridden directly. That is a private API, used
 * here deliberately and only here: this file is dev-only and never reaches the
 * bundle, and the alternative was adding a `pathname` prop to the real
 * component that existed solely so a preview could set it. The navigator is
 * left alone - nothing in a screenshot is ever clicked.
 */
const At = ({ pathname }) => (
  <LocationContext.Provider
    value={{
      location: { pathname, search: '', hash: '', state: null, key: 'preview' },
      navigationType: 'POP',
    }}
  >
    <SiteFooter />
  </LocationContext.Provider>
);

const FooterPreview = () => (
  <ContentContext.Provider value={VALUE}>
    {/* A short spacer rather than none: the footer's top border and its accent
        hairline are the join between page and footer, and a join needs
        something on the other side of it to be judged. */}
    <div style={{ height: '8vh' }} />

    {/* The common case. On /bio the next page is Projects. */}
    <At pathname="/bio" />

    {/* The 404 case: no next page, so the call to action is alone in the lead
        row and has to hold the full width by itself. */}
    <At pathname="/nowhere" />
  </ContentContext.Provider>
);

export default FooterPreview;
