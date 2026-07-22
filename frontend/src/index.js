import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components';

import './styles/Theme.css';
import './styles/Wrappers.css';
import './styles/Components.css';
import './styles/lenis.css';

function ErrorBoundaryWrapper({ children }) {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      {children}
    </ErrorBoundary>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundaryWrapper>
        <App />
      </ErrorBoundaryWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
