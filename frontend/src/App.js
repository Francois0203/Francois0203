import React, { Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate, Outlet } from 'react-router-dom';
import ThemeSwitch from './components/ThemeSwitch';
import NavigationBar from './components/NavigationBar';
import useTheme from './hooks/useTheme';

// Eager load Home page
import Home from './pages/Home';

// Lazy load other pages
// const About = React.lazy(() => import('./pages/About'));

const validRoutes = ['/'];

const pages = [
  { label: 'Home', to: '/' },
];

const Loading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: 'var(--font-size-lg)',
    color: 'var(--primary-text-color)'
  }}>
    Loading...
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isValidRoute = validRoutes.includes(location.pathname);
  const activePage = pages.find(page => page.to === location.pathname);

  const handleNavigate = (to) => {
    if (to) navigate(to);
  };

  return (
    <div>
      <header className="header-wrapper">
        <div className="header-main-row">
          <NavigationBar 
            links={pages} 
            onNavigate={handleNavigate}
          />
          <div className="header-title">
            {activePage?.label || ''}
          </div>
          {isValidRoute && (
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
              <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
            </div>
          )}
        </div>
      </header>

      <main className="page-content">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        {/* <Route path="/about" element={ <Suspense fallback={<Loading />}> <About /> </Suspense> } /> */}
      </Route>
    </Routes>
  );
};

export default App;