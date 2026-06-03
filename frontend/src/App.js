import React, { Suspense, useCallback, useMemo, useTransition, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { NotFound, Loading, Connect, Projects, Bio, Home, Admin } from './pages';
import { NavigationBar, Settings, ToastProvider } from './components';
import { useTheme, useAnimations } from './hooks';
import styles from './App.module.css';

const NAVIGATION_PAGES = [
  { label: 'Home',     to: '/'        },
  { label: 'Bio',      to: '/bio'     },
  { label: 'Projects', to: '/projects'},
  { label: 'Connect',  to: '/connect' },
];

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [, startTransition] = useTransition();

  const handleNavigate = useCallback((to) => {
    if (to) startTransition(() => navigate(to));
  }, [navigate, startTransition]);

  const navigationLinks = useMemo(() => NAVIGATION_PAGES.map(p => ({ ...p })), []);

  return (
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
      </div>
    </div>
  );
};

const AppContent = () => (
  <>
    <ScrollToTop />
    <Routes>
      {/* Admin — standalone, no nav bar */}
      <Route path="/admin" element={<Admin />} />

      <Route path="/" element={<AppLayout />}>
        <Route index             element={<Home />} />
        <Route path="bio"        element={<Bio />} />
        <Route path="connect"    element={<Connect />} />
        <Route path="projects"   element={<Projects />} />
        <Route path="loading"    element={<Loading />} />
        <Route path="*"          element={<NotFound />} />
      </Route>
    </Routes>
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
