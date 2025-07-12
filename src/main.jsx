import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react"
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <SpeedInsights>
        <App />
      </SpeedInsights>
    </HashRouter>
  </StrictMode>
);