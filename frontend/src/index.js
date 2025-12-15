import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from '@francois0203/ui';

/* Styling  */
import '@francois0203/ui/dist/styles/Theme.css';
import '@francois0203/ui/dist/styles/Components.css';
import '@francois0203/ui/dist/styles/Wrappers.css';

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/Francois0203">
      {/* ErrorBoundaryWrapper must be inside BrowserRouter so hooks work */}
      <ErrorBoundaryWrapper>
        <App />
      </ErrorBoundaryWrapper>
    </BrowserRouter>
  </React.StrictMode>
);