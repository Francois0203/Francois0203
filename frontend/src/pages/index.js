import { lazy } from 'react';

/*
 * Routes are lazy on purpose, which is what makes the <Suspense> in App.js real:
 * the admin (eleven sections, both editor forms, react-select) is only fetched
 * by someone who opens /admin, and Projects only pulls react-markdown when
 * visited.
 *
 * Loading stays eager - it IS the Suspense fallback, so lazy-loading it would
 * mean suspending to render the thing shown while suspended.
 */
export { default as Loading } from './Loading';

export const Home     = lazy(() => import('./Home'));
export const Bio      = lazy(() => import('./Bio'));
export const Projects = lazy(() => import('./Projects'));
export const Connect  = lazy(() => import('./Connect'));
export const NotFound = lazy(() => import('./Not Found'));
export const Admin    = lazy(() => import('./Admin'));
