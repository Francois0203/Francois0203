import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components';

import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/martian-mono';

import './styles/tokens.css';
import './styles/base.css';
import './styles/reveal.css';
import './styles/admin-support.css';

/* Keyed on the path, so an error on one route does not leave the whole app in
   a failed state after navigating away from it. */
function Boundary({ children }) {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Boundary>
        <App />
      </Boundary>
    </BrowserRouter>
  </React.StrictMode>
);
