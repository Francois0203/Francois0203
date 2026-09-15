import { lazy } from 'react';

/*
 * Routes are lazy, which is what makes the Suspense in App.js real: /admin
 * is only fetched by someone who opens it, and Projects only pulls
 * react-markdown when visited. Loading stays eager: it IS the fallback.
 */
export { default as Loading } from './Loading';

export const Home     = lazy(() => import('./Home'));
export const Bio      = lazy(() => import('./Bio'));
export const Projects = lazy(() => import('./Projects'));
export const Connect  = lazy(() => import('./Connect'));
export const NotFound = lazy(() => import('./Not Found'));
export const Admin    = lazy(() => import('./Admin'));
