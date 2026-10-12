import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { NotFound, Loading, Connect, Projects, Bio, Home, Admin } from './pages';
import { ToastProvider } from './components';
import Nav from './components/Nav';
import Foot from './components/Foot';
import Intro from './components/Intro';
import { useTheme, useAnimations, scrollPageTo } from './hooks';
import { ContentProvider } from './context/ContentContext';
import { NAVIGATION_PAGES } from './content/navigation';
import styles from './App.module.css';

/* Dev only. DEV is statically false in a build, so Rollup drops it. */
const PagePreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/PagePreview'))
  : null;

const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

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
      positions.current.set(key, window.scrollY);
      window.removeEventListener('scroll', onScroll);
    };
  }, [key]);

  useEffect(() => {
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

    const restore = navigationType === 'POP' ? positions.current.get(key) ?? 0 : 0;
    scrollPageTo(restore, { immediate: true });
    if (restore === 0) return undefined;

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

/* The public site runs on native scroll. Lenis lives in /admin only. */
// Highlighted text takes the current page's tab colour.
const useSelectionTone = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const tone = NAVIGATION_PAGES.find(p => p.to === pathname)?.tone ?? 'yellow';
    const root = document.documentElement.style;
    root.setProperty('--sel', `var(--c-${tone})`);
    root.setProperty('--sel-on', tone === 'blue' ? '#ffffff' : '#1f1f1f');
  }, [pathname]);
};

const AppLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const links = useMemo(() => NAVIGATION_PAGES.map(p => ({ ...p })), []);
  useSelectionTone();

  return (
    <ContentProvider>
      <Intro />

      <div className={styles.app}>
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
