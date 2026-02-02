import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useNavigate, useLocation } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components';

/* Styling  */
import './styles/Theme.css';
import './styles/Wrappers.css';
import './styles/Components.css';

function ErrorBoundaryWrapper({ children }) {
  // hooks must be used inside Router; this wrapper will be rendered inside <BrowserRouter>
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ErrorBoundary
      fallbackPath="/"
      navigate={navigate}
      onGoHome={() => navigate('/')}
      key={location.pathname}
    >
      {children}
    </ErrorBoundary>
  );
}

// If the app is served on static hosting or visited via a pathname (no hash),
// map the pathname to a hash-based route so `HashRouter` can handle it.
(() => {
  try {
    const base = '/Francois0203';
    const { pathname, hash, origin, search } = window.location;
    if (!hash || hash === '' || hash === '#') {
      if (pathname.startsWith(base)) {
        const sub = pathname.slice(base.length) || '/';
        const newUrl = `${origin}${base}/#${sub}${search}`;
        if (newUrl !== window.location.href) {
          window.location.replace(newUrl);
        }
      } else if (pathname !== '/' && pathname !== '') {
        const newUrl = `${origin}/#${pathname}${search}`;
        if (newUrl !== window.location.href) {
          window.location.replace(newUrl);
        }
      }
    }
  } catch (e) {
    // ignore in non-browser environments
  }
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      {/* ErrorBoundaryWrapper must be inside BrowserRouter so hooks work */}
      <ErrorBoundaryWrapper>
        <App />
      </ErrorBoundaryWrapper>
    </HashRouter>
  </React.StrictMode>
);