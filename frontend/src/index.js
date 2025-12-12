import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

/* Styling  */
import '@Francois0203/ui/dist/styles/Theme.css';
import '@Francois0203/ui/dist/styles/Components.css';
import '@Francois0203/ui/dist/styles/GeneralWrappers.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
