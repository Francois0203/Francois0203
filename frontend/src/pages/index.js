import { lazy } from 'react';

export { default as Loading } from './Loading';

export const Home     = lazy(() => import('./Home'));
export const Bio      = lazy(() => import('./Bio'));
export const Projects = lazy(() => import('./Projects'));
export const Connect  = lazy(() => import('./Connect'));
export const NotFound = lazy(() => import('./Not Found'));
export const Admin    = lazy(() => import('./Admin'));
