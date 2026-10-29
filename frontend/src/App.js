import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { NotFound, Loading, Connect, Projects, Bio, Home, Admin, Privacy, Terms } from './pages';
import { ToastProvider } from './components';
import Nav from './components/Nav';
import Foot from './components/Foot';
import Intro from './components/Intro';
import { useTheme, useAnimations, scrollPageTo } from './hooks';
import { markSeen } from './hooks/useReveal';
import { ContentProvider } from './context/ContentContext';
import { NAVIGATION_PAGES, fillOf } from './content/navigation';
import { metaFor, absoluteUrl } from './content/seo';
import styles from './App.module.css';

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

// A page you leave counts as seen, so its titles show at once when you return.
const useSeenPages = () => {
  const { pathname } = useLocation();
  const last = useRef(pathname);
  useEffect(() => {
    if (last.current !== pathname) markSeen(last.current);
    last.current = pathname;
  }, [pathname]);
};

// Highlighted text takes the current page's tab colour.
const useSelectionTone = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const tone = NAVIGATION_PAGES.find(p => p.to === pathname)?.tone ?? 'yellow';
    const root = document.documentElement.style;
    root.setProperty('--sel', fillOf(tone));
    root.setProperty('--sel-on', '#1f1f1f');
  }, [pathname]);
};

// The build gives each route its own head; this keeps it right after in-app navigation.
const setHeadTag = (selector, create, attr, value) => {
  let tag = document.head.querySelector(selector);
  if (value == null) { tag?.remove(); return; }
  if (!tag) { tag = create(); document.head.appendChild(tag); }
  tag.setAttribute(attr, value);
};

const usePageMeta = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = metaFor(pathname);
    const url = page.noindex ? null : absoluteUrl(page.path);
    document.title = page.title;
    const meta = (key, name) => () => Object.assign(document.createElement('meta'), { [key]: name });
    setHeadTag('meta[name="description"]', meta('name', 'description'), 'content', page.description ?? null);
    setHeadTag('meta[name="robots"]', meta('name', 'robots'), 'content', page.noindex ? 'noindex, nofollow' : null);
    setHeadTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url);
  }, [pathname]);
};

const AppLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const links = useMemo(() => NAVIGATION_PAGES.map(p => ({ ...p })), []);
  useSelectionTone();
  useSeenPages();

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
  usePageMeta();

  return (
    <ToastProvider>
      <ScrollToTop />

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/admin" element={<Admin />} />

          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="bio" element={<Bio />} />
            <Route path="projects" element={<Projects />} />
            <Route path="connect" element={<Connect />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
};

export default App;
