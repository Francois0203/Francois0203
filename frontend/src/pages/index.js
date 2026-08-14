import { lazy } from 'react';

/*
 * Routes are lazy on purpose, and that is what makes the <Suspense> in App.js real.
 *
 * These used to be static re-exports, so every page shipped in the first bundle to
 * every anonymous visitor - the whole admin included, with its eleven section
 * files, both editor forms and react-select. Nothing ever suspended, so the
 * Loading fallback was decoration. Splitting them means the admin is only fetched
 * by someone who actually opens /admin, and Projects only pulls react-markdown
 * (plus remark-gfm and rehype-raw) when that page is visited.
 *
 * Loading itself stays eager: it IS the Suspense fallback, so lazy-loading it
 * would mean suspending in order to render the thing shown while suspended.
 */
export { default as Loading } from './Loading';

export const Home     = lazy(() => import('./Home'));
export const Bio      = lazy(() => import('./Bio'));
export const Projects = lazy(() => import('./Projects'));
export const Connect  = lazy(() => import('./Connect'));
export const NotFound = lazy(() => import('./Not Found'));
export const Admin    = lazy(() => import('./Admin'));
