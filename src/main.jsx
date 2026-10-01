import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted fonts: no request to a third-party font CDN.
import '@fontsource/syne/600.css';
import '@fontsource/syne/700.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/jetbrains-mono/400.css';
import './styles.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
