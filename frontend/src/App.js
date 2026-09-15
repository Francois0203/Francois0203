import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { NotFound, Loading, Connect, Projects, Bio, Home, Admin } from './pages';
import { ToastProvider } from './components';
import Field from './components/Field';
import Nav from './components/Nav';
import Foot from './components/Foot';
import Intro from './components/Intro';
import { useTheme, useAnimations, useMomentumScroll, scrollPageTo } from './hooks';
import { ContentProvider } from './context/ContentContext';
import { NAVIGATION_PAGES } from './content/navigation';
import styles from './App.module.css';

/* Dev only. DEV is statically false in a build, so Rollup drops it. */
const PagePreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/PagePreview'))
  : null;

/*
 * Where a navigation lands: an anchor if the URL names one, the previous
 * position on back and forward, the top otherwise.
 */
const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  // A ref, not state: nothing renders from it.
  const positions = useRef(new Map());

  // The browser's own restore fights ours, so we own it outright.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // One number to a ref, at most five times a second.
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const now = performance.now();
      if (now - last < 200) return;
      last = now;
      positions.current.set(key, window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      // A final sample, in case they left inside the throttle window.
      positions.current.set(key, window.scrollY);
      window.removeEventListener('scroll', onScroll);
    };
  }, [key]);

  useEffect(() => {
    // An anchor wins. It may not exist yet, so it is retried.
    if (hash) {
      let timer = 0;
      let tries = 0;
      const land = () => {
        const target = document.querySelector(hash);
        if (target) { scrollPageTo(target, { immediate: true }); return; }
        tries += 1;
        if (tries < 12) timer = setTimeout(land, 90);
      };
      timer = setTimeout(land, 0);
      return () => clearTimeout(timer);
    }

    // Nobody follows a link expecting to land halfway down a new page.
    const restore = navigationType === 'POP' ? positions.current.get(key) ?? 0 : 0;

    scrollPageTo(restore, { immediate: true });

    if (restore === 0) return undefined;

    // Going back lands on a page still arriving, so the position clamps.
    let timer = 0;
    let tries = 0;
    const settle = () => {
      if (Math.abs(window.scrollY - restore) > 2) scrollPageTo(restore, { immediate: true });
      tries += 1;
      if (tries < 10) timer = setTimeout(settle, 100);
    };
    timer = setTimeout(settle, 60);
    return () => clearTimeout(timer);
  }, [pathname, hash, key, navigationType]);

  return null;
};

const AppLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const links = useMemo(() => NAVIGATION_PAGES.map(p => ({ ...p })), []);

  /* Momentum scrolling. It advances the real scroll position from the main
     thread each frame, so scroll driven CSS still reads a true offset, and
     ScrollToTop drives this instance rather than fighting it with
     window.scrollTo. Off under reduced motion and the motion toggle. */
  useMomentumScroll();

  return (
    <ContentProvider>
      <Intro />

      <div className={styles.app}>
        {/* Layer 0, mounted once so the ground is continuous. */}
        <Field />

        <Nav links={links} theme={theme} toggleTheme={toggleTheme} />

        <main className={styles.main}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>

        <Foot />
      </div>
    </ContentProvider>
  );
};

const App = () => {
  // Applies the theme to the document root for every route, /admin included.
  useTheme();
  useAnimations();

  return (
    <ToastProvider>
      <ScrollToTop />

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/admin" element={<Admin />} />

          {import.meta.env.DEV && (
            <Route path="/__preview/:name" element={<PagePreview />} />
          )}

          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="bio" element={<Bio />} />
            <Route path="projects" element={<Projects />} />
            <Route path="connect" element={<Connect />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
};

export default App;
