import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components';

import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/onest';
import '@fontsource-variable/jetbrains-mono';

import './styles/index.css';
import { markTier } from './tier';

// Before the first paint, so the intro already knows how much this machine can draw.
markTier();

// Load and error do not bubble, but they can be caught on the way down: one listener marks every image when it settles.
const settled = (e) => { if (e.target instanceof HTMLImageElement) e.target.dataset.loaded = ''; };
document.addEventListener('load', settled, true);
document.addEventListener('error', settled, true);

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
