import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components';

import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/onest';
import '@fontsource-variable/jetbrains-mono';

import './styles/tokens.css';
import './styles/base.css';
import './styles/reveal.css';
import './styles/admin-support.css';
import './styles/print.css';

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
