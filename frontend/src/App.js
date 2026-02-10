/* ============================================================================
 * APP - MAIN APPLICATION COMPONENT
 * ============================================================================
 * Root component managing routing, layout, and theme
 * ============================================================================
 */

import React, { Suspense, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, Outlet } from 'react-router-dom';

/* ========================================
 * IMPORTS - Pages
 * ======================================== */
import { NotFound, Loading } from './pages';

/* ========================================
 * IMPORTS - Components
 * ======================================== */
import { NavigationBar, Settings, ToastProvider, PageTransition } from './components';

/* ========================================
 * IMPORTS - Hooks
 * ======================================== */
import { useTheme } from './hooks';

/* ========================================
 * IMPORTS - Styling
 * ======================================== */
import styles from './App.module.css';

/* ============================================================================
 * LAZY LOADED COMPONENTS
 * ============================================================================
 * Pages are lazy loaded to improve initial bundle size and performance
 * ============================================================================
 */
const Home = React.lazy(() => import('./pages/Home'));
const Bio = React.lazy(() => import('./pages/Bio'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Projects = React.lazy(() => import('./pages/Projects'));

/* ============================================================================
 * NAVIGATION STRUCTURE
 * ============================================================================
 * Define all navigation routes and labels in one place
 * ============================================================================
 */
const NAVIGATION_PAGES = [
  {
    label: 'Home',
    to: '/'
  },
  {
    label: 'Bio',
    to: '/bio'
  },
  {
    label: 'Notable Projects',
    to: '/projects'
  },
  {
    label: 'Contact',
    to: '/contact'
  }
];

/* ============================================================================
 * LOADING FALLBACK COMPONENT
 * ============================================================================
 * Displayed while lazy-loaded components are being fetched
 * ============================================================================
 */
const LoadingFallback = () => <Loading />;

/* ============================================================================
 * APP LAYOUT COMPONENT
 * ============================================================================
 * Main layout wrapper containing navigation, settings, and page content
 * Uses memoization for optimal performance
 * ============================================================================
 */
const AppLayout = () => {
  // ========================================
  // HOOKS & REFS
  // ========================================
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // ========================================
  // HANDLERS - Memoized for performance
  // ========================================
  const handleNavigate = useCallback((to) => {
    if (to) navigate(to);
  }, [navigate]);

  // ========================================
  // MEMOIZED VALUES
  // ========================================
  const navigationLinks = useMemo(() => 
    NAVIGATION_PAGES.map(page => ({
      ...page,
      onClick: page.onClick ? () => page.onClick(navigate) : undefined
    })),
    [navigate]
  );

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={styles.app}>
      {/* Global Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* Fixed Navigation Bar - Hovers over content */}
      <NavigationBar
        links={navigationLinks}
        onNavigate={handleNavigate}
        className={styles.navigationBar}
      />
      
      {/* Fixed Settings Button - Top right corner */}
      <div className={styles.themeSwitch}>
        <Settings
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>
      
      {/* Main Page Content - Full viewport */}
      <div className={styles.pageContent}>
        <Suspense fallback={<LoadingFallback />}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Suspense>
      </div>
    </div>
  );
};

/* ========================================
 * MEMOIZED APP LAYOUT
 * ======================================== */
const MemoizedAppLayout = React.memo(AppLayout);

/* ============================================================================
 * APP CONTENT COMPONENT
 * ============================================================================
 * Defines all application routes with lazy-loaded pages
 * ============================================================================
 */
const AppContent = () => {
  return (
    <Routes>
      {/* Main Layout Route */}
      <Route path="/" element={<MemoizedAppLayout />}>
        {/* Page Routes */}
        <Route index element={<Home />} />
        <Route path="bio" element={<Bio />} />
        <Route path="contact" element={<Contact />} />
        <Route path="projects" element={<Projects />} />
        
        {/* 404 Not Found - Catch all unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

/* ============================================================================
 * ROOT APP COMPONENT
 * ============================================================================
 * Root component that wraps the entire application
 * Initializes theme and provides toast notifications context
 * ============================================================================
 */
const App = () => {
  // ========================================
  // INITIALIZATION
  // ========================================
  // Initialize theme at root level for global application
  useTheme();

  // ========================================
  // RENDER
  // ========================================
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;