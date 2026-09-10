import React, { Suspense, useCallback, useMemo, useTransition, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { NotFound, Loading, Connect, Projects, Bio, Home, Admin } from './pages';
import { NavigationBar, Settings, ToastProvider, Intro } from './components';
import SiteFooter from './components/SiteFooter';
import { useTheme, useAnimations, useMomentumScroll, getLenis } from './hooks';
import { ContentProvider } from './context/ContentContext';
import { NAVIGATION_PAGES } from './content/navigation';
import styles from './App.module.css';

/*
 * Dev-only component previews. Rendered outside AppLayout so there is no intro,
 * no nav and no Firestore: a measured component can only be checked by looking
 * at it, and the live page cannot be relied on to have loaded when you do.
 * import.meta.env.DEV is statically false in a production build, so Rollup
 * drops both the route and the import.
 */
const RoadmapPreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/RoadmapPreview'))
  : null;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Both, not one or the other: Lenis keeps its own scroll position, so
    // resetting only the window leaves it convinced the page is still scrolled
    // down, and the first wheel notch on the new page jumps back there.
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [, startTransition] = useTransition();

  // Momentum scrolling for the public site only - this layout is not mounted
  // on the standalone /admin route, so the admin keeps native scrolling.
  useMomentumScroll();

  const handleNavigate = useCallback((to) => {
    if (to) startTransition(() => navigate(to));
  }, [navigate, startTransition]);

  const navigationLinks = useMemo(() => NAVIGATION_PAGES.map(p => ({ ...p })), []);

  /*
   * ContentProvider sits here rather than at the app root so it covers every
   * public page (this layout is not remounted by navigation between them, so the
   * Firestore reads happen once) while /admin, which is a sibling route, never
   * triggers them.
   */
  return (
    <ContentProvider>
      {/* Public site only - it lives in this layout rather than at the app root
          so /admin, a sibling route, never plays it. It plays once per page
          load and gates itself internally, so this layout remounting on the
          way back from /admin does not replay it. */}
      <Intro />

      {/* Reading progress. Driven entirely by animation-timeline: scroll(), so
          there is no scroll listener behind it - the compositor advances it.
          styles/Reveal.css hides it where that is unsupported rather than
          leaving a bar that never fills. */}
      <div className="scrollProgress" aria-hidden="true" />

      <div className={styles.app}>
        <NavigationBar
          links={navigationLinks}
          onNavigate={handleNavigate}
          className={styles.navigationBar}
        />

        <div className={styles.themeSwitch}>
          <Settings theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div key={location.pathname} className={styles.pageContent}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>

          {/* Inside the keyed wrapper, so it participates in the page
              transition rather than sitting still while the page changes
              above it. It reads the route itself for the "next page" pointer,
              so it re-renders with the page either way. */}
          <SiteFooter />
        </div>
      </div>
    </ContentProvider>
  );
};

const AppContent = () => (
  <>
    <ScrollToTop />
    {/* Admin sits outside AppLayout, so it needs its own boundary - the layout's
        Suspense only covers the public Outlet. Every route is lazy now (see
        pages/index.js), and a lazy element with no boundary above it throws. */}
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Admin - standalone, no nav bar */}
        <Route path="/admin" element={<Admin />} />

        {import.meta.env.DEV && (
          <Route path="/__preview/roadmap" element={<RoadmapPreview />} />
        )}

        <Route path="/" element={<AppLayout />}>
          <Route index             element={<Home />} />
          <Route path="bio"        element={<Bio />} />
          <Route path="connect"    element={<Connect />} />
          <Route path="projects"   element={<Projects />} />
          <Route path="loading"    element={<Loading />} />
          <Route path="*"          element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </>
);

const App = () => {
  useTheme();
  useAnimations();
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
